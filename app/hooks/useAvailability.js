'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAvailability, availabilityStreamUrl } from '../services/reservationsApi';

const POLLING_INTERVAL_MS = 30000;

// Disponibilità di una data, sempre fresca: aggiornata via SSE quando il titolare (o un altro cliente)
// cambia la capienza, con polling e refetch al ritorno sulla scheda come rete di sicurezza.
export default function useAvailability(date) {
  const [availability, setAvailability] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const latestRequest = useRef(0);

  const load = useCallback(async (isSilent) => {
    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;
    if (!isSilent) setIsLoading(true);
    try {
      const data = await fetchAvailability(date);
      if (latestRequest.current !== requestId) return;
      setAvailability(data);
      setHasError(false);
    } catch {
      if (latestRequest.current === requestId) setHasError(true);
    } finally {
      if (latestRequest.current === requestId) setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    if (!date) {
      latestRequest.current += 1;
      setAvailability(null);
      setIsLoading(false);
      return undefined;
    }
    setAvailability(null);
    load(false);

    let source = null;
    if (typeof EventSource !== 'undefined') {
      source = new EventSource(availabilityStreamUrl());
      source.onmessage = (event) => {
        try {
          if (JSON.parse(event.data).date === date) load(true);
        } catch { /* messaggio non valido: ignorato, il polling ricopre */ }
      };
    }
    const poll = setInterval(() => load(true), POLLING_INTERVAL_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') load(true); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      if (source) source.close();
      clearInterval(poll);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [date, load]);

  return { availability, isLoading, hasError };
}
