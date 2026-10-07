// Stili condivisi dai form del backoffice, scoped dalla classe .admin-form.
// Vanno resi con un <style> normale: styled-jsx non elabora CSS passato come variabile.
// Solo token del design system; input a 16px (evita lo zoom automatico su iOS) e target da 44px.
export const ADMIN_FORM_CSS = `
  .admin-form { color: var(--color-paper); font-family: var(--font-body); }
  .admin-form h2 { font-size: 1.25rem; font-weight: 500; color: var(--color-paper); margin: var(--s-8) 0 var(--s-4); }
  .admin-form .field { display: flex; flex-direction: column; gap: var(--s-2); margin-bottom: var(--s-4); min-width: 0; }
  .admin-form label {
    font-family: var(--font-mono); font-size: 0.72rem; font-weight: 500; text-transform: uppercase;
    letter-spacing: 0.08em; color: var(--color-text-soft); line-height: 1.4;
  }
  .admin-form input:not([type="checkbox"]), .admin-form select, .admin-form textarea {
    width: 100%; box-sizing: border-box; min-height: 44px; padding: var(--s-3) var(--s-4);
    background: var(--color-ink); color: var(--color-paper); color-scheme: dark;
    border: 1px solid var(--color-line-strong); border-radius: var(--r-sm);
    font-family: var(--font-body); font-size: 1rem; line-height: 1.4;
    transition: border-color var(--dur-fast) var(--ease);
  }
  .admin-form textarea { resize: vertical; min-height: 88px; }
  .admin-form input::placeholder, .admin-form textarea::placeholder { color: var(--color-text-dim); font-style: italic; }
  .admin-form input:not([type="checkbox"]):focus, .admin-form select:focus, .admin-form textarea:focus { border-color: var(--color-brass-bright); }
  .admin-form input:focus-visible, .admin-form select:focus-visible, .admin-form textarea:focus-visible,
  .admin-form button:focus-visible, .admin-form input[type="checkbox"]:focus-visible { outline: 2px solid var(--color-brass-bright); outline-offset: 2px; }
  .admin-form input[type="checkbox"] { width: 24px; height: 24px; flex-shrink: 0; accent-color: var(--color-brass); cursor: pointer; }
  .admin-form .check { display: flex; align-items: flex-start; gap: var(--s-3); text-transform: none; letter-spacing: 0; font-family: var(--font-body); font-size: 0.9rem; cursor: pointer; }
  .admin-form .row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-4); }
  @media (max-width: 600px) { .admin-form .row { grid-template-columns: 1fr; gap: 0; } }
  .admin-form .hint { color: var(--color-text-dim); font-size: 0.8125rem; line-height: 1.5; margin: 0; }
  .admin-form .error {
    color: var(--color-danger); background: rgba(217, 138, 125, 0.1); border: 1px solid rgba(217, 138, 125, 0.35);
    border-radius: var(--r-sm); padding: var(--s-3) var(--s-4); font-size: 0.9rem; line-height: 1.5; margin: var(--s-2) 0 0;
  }
  .admin-form .error::before { content: "⚠ "; }
  .admin-form .actions { display: flex; justify-content: flex-end; gap: var(--s-3); margin-top: var(--s-6); flex-wrap: wrap; }
  @media (max-width: 480px) { .admin-form .actions { flex-direction: column-reverse; } .admin-form .actions button { width: 100%; } }
  .admin-form .btn-primary, .admin-form .btn-secondary, .admin-form .btn-danger {
    min-height: 44px; padding: 0 var(--s-6); border-radius: var(--r-sm); font-family: var(--font-body);
    font-size: 0.9375rem; font-weight: 500; cursor: pointer;
    transition: background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
  }
  .admin-form .btn-primary { background: var(--color-brass); color: var(--color-ink); border: 1px solid var(--color-brass); font-weight: 600; }
  .admin-form .btn-primary:hover:not(:disabled) { background: var(--color-brass-bright); border-color: var(--color-brass-bright); }
  .admin-form .btn-danger { background: rgba(217, 138, 125, 0.12); color: var(--color-danger); border: 1px solid rgba(217, 138, 125, 0.5); }
  .admin-form .btn-danger:hover:not(:disabled) { background: rgba(217, 138, 125, 0.22); }
  .admin-form .btn-secondary { background: transparent; color: var(--color-paper); border: 1px solid var(--color-line-strong); }
  .admin-form .btn-secondary:hover:not(:disabled) { border-color: var(--color-brass-bright); }
  .admin-form button:disabled { opacity: 0.5; cursor: not-allowed; }
  @media (prefers-reduced-motion: reduce) {
    .admin-form input, .admin-form select, .admin-form textarea, .admin-form button { transition: none; }
  }
`;
