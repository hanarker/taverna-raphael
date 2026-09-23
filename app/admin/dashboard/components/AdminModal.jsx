'use client';

/**
 * Modale accessibile riutilizzata dalle azioni del backoffice.
 * @param {{ title: string, onClose: () => void, children: React.ReactNode }} props
 */
export default function AdminModal({ title, onClose, children }) {
  return (
    <div className="overlay no-print" role="dialog" aria-modal="true" aria-label={title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div className="modal">
        <div className="head">
          <h3>{title}</h3>
          <button type="button" className="close" onClick={onClose} aria-label="Chiudi">✕</button>
        </div>
        {children}
      </div>

      <style jsx>{`
        .overlay {
          position: fixed; inset: 0; z-index: 2000; background: rgba(0, 0, 0, 0.6);
          display: flex; align-items: center; justify-content: center; padding: var(--s-4);
        }
        .modal {
          background: var(--color-ink-light); border: 1px solid var(--color-line-strong); border-radius: var(--r-md);
          padding: var(--s-8); width: 100%; max-width: 520px; max-height: 90dvh; overflow-y: auto;
        }
        .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--s-6); }
        h3 { font-family: var(--font-display); font-style: italic; font-size: 1.4rem; margin: 0; color: var(--color-paper); }
        .close {
          background: none; border: none; color: var(--color-text-soft); cursor: pointer;
          width: 44px; height: 44px; font-size: 1.1rem;
        }
        .close:focus-visible { outline: 2px solid var(--color-brass-bright); outline-offset: 2px; }
      `}</style>
    </div>
  );
}
