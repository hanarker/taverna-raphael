'use client';

export default function CookiePolicyPage() {
    return (
        <>
            <div className="page-hero">
                <div className="container page-hero-inner">
                    <span className="eyebrow">Informativa</span>
                    <h1>Cookie Policy</h1>
                    <div className="divider-line" aria-hidden="true" />
                    <p className="last-update">Ultimo aggiornamento: gennaio 2026</p>
                </div>
            </div>

            <div className="section container policy-body">
                <section className="policy-section">
                    <h2>Cosa sono i cookie</h2>
                    <p>
                        I cookie sono piccoli file di testo che i siti web visitati inviano al dispositivo dell&apos;utente,
                        dove vengono memorizzati per essere ritrasmessi agli stessi siti alla visita successiva.
                        Grazie ai cookie un sito ricorda le azioni e le preferenze dell&apos;utente così da non
                        doverle reinserire ad ogni visita.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>Cookie utilizzati da questo sito</h2>
                    <p>
                        Questo sito utilizza esclusivamente <strong>cookie tecnici</strong>, necessari al
                        funzionamento e indispensabili per fornire i servizi richiesti. Non vengono utilizzati
                        cookie di profilazione o di tracciamento.
                    </p>
                    <div className="table-wrapper">
                        <table className="policy-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Tipo</th>
                                    <th>Durata</th>
                                    <th>Scopo</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><code>cookieConsent</code></td>
                                    <td>Tecnico (localStorage)</td>
                                    <td>1 anno</td>
                                    <td>Memorizza la scelta dell&apos;utente riguardo al consenso cookie</td>
                                </tr>
                                <tr>
                                    <td><code>token</code></td>
                                    <td>Tecnico (localStorage)</td>
                                    <td>1 giorno</td>
                                    <td>Sessione di autenticazione area amministrativa (solo staff)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="policy-section">
                    <h2>Cookie di terze parti</h2>
                    <p>
                        Il sito carica i font tipografici tramite <strong>Google Fonts</strong>. Questo servizio
                        può trasmettere dati ai server Google per fornire i file dei font. Google dichiara che
                        questi dati non vengono utilizzati per profilare gli utenti. Per maggiori informazioni
                        consultare la{' '}
                        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="policy-link">
                            Privacy Policy di Google
                        </a>.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>Come gestire i cookie</h2>
                    <p>Puoi revocare il consenso cancellando i dati di navigazione dal tuo browser:</p>
                    <ul className="policy-list">
                        <li><strong>Google Chrome:</strong> Menu → Impostazioni → Privacy e sicurezza → Cancella dati di navigazione</li>
                        <li><strong>Mozilla Firefox:</strong> Menu → Impostazioni → Privacy e sicurezza → Elimina dati</li>
                        <li><strong>Safari:</strong> Preferenze → Privacy → Gestisci dati sito web → Rimuovi tutto</li>
                        <li><strong>Microsoft Edge:</strong> Menu → Impostazioni → Privacy, ricerca e servizi → Cancella dati</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>Modifiche alla policy</h2>
                    <p>
                        Taverna Raphael si riserva il diritto di apportare modifiche alla presente Cookie Policy
                        in qualsiasi momento. Per informazioni:{' '}
                        <a href="mailto:info@tavernaraphael.it" className="policy-link">info@tavernaraphael.it</a>
                    </p>
                </section>
            </div>

            <style jsx>{`
                .page-hero {
                    background: var(--color-panna);
                    padding: calc(80px + var(--s-12)) 0 var(--s-12);
                }

                .page-hero-inner {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: var(--s-2);
                    max-width: 800px;
                }

                .page-hero-inner h1 {
                    font-size: clamp(2.5rem, 4vw, 3.5rem);
                    line-height: 1;
                    margin: var(--s-2) 0 var(--s-4);
                }

                .last-update {
                    font-size: 0.875rem;
                    color: var(--color-muted);
                    font-style: italic;
                    margin: 0;
                }

                .policy-body {
                    max-width: 800px;
                }

                .policy-section {
                    margin-bottom: var(--s-12);
                }

                .policy-section h2 {
                    font-size: 1.5rem;
                    color: var(--color-ink);
                    margin-bottom: var(--s-3);
                    padding-bottom: var(--s-3);
                    border-bottom: 1px solid var(--color-line);
                    position: relative;
                }

                .policy-section h2::after {
                    content: '';
                    position: absolute;
                    bottom: -1px;
                    left: 0;
                    width: 32px;
                    height: 2px;
                    background: var(--color-sabbia);
                }

                .policy-section p {
                    color: var(--color-muted);
                    line-height: 1.8;
                    margin-bottom: var(--s-4);
                }

                .policy-section strong {
                    color: var(--color-ink);
                    font-weight: 600;
                }

                .table-wrapper {
                    overflow-x: auto;
                    margin-top: var(--s-6);
                    border: 1px solid var(--color-line);
                    border-radius: var(--r-md);
                }

                .policy-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.9rem;
                }

                .policy-table th {
                    font-family: var(--font-body);
                    font-size: var(--fs-eyebrow);
                    font-weight: 500;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: var(--color-sabbia);
                    padding: var(--s-4);
                    text-align: left;
                    background: var(--color-panna);
                    border-bottom: 1px solid var(--color-line);
                }

                .policy-table td {
                    padding: var(--s-4);
                    color: var(--color-muted);
                    border-bottom: 1px solid var(--color-line);
                    vertical-align: top;
                    line-height: 1.6;
                }

                .policy-table tr:last-child td {
                    border-bottom: none;
                }

                .policy-table tr:nth-child(even) td {
                    background: var(--color-panna);
                }

                :global(code) {
                    font-family: monospace;
                    background: var(--color-panna);
                    border: 1px solid var(--color-line);
                    padding: 0.1rem 0.35rem;
                    border-radius: 2px;
                    font-size: 0.85em;
                    color: var(--color-ink);
                }

                .policy-list {
                    list-style: none;
                    padding: 0;
                    margin: var(--s-4) 0;
                }

                .policy-list li {
                    color: var(--color-muted);
                    padding: var(--s-3) 0 var(--s-3) var(--s-4);
                    border-left: 2px solid var(--color-sabbia);
                    margin-bottom: var(--s-2);
                    line-height: 1.6;
                }

                .policy-link {
                    color: var(--color-ink);
                    font-weight: 500;
                    text-decoration: underline;
                    text-decoration-color: var(--color-sabbia);
                    text-underline-offset: 3px;
                }

                .policy-link:hover {
                    color: var(--color-sabbia);
                }
            `}</style>
        </>
    );
}
