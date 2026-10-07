---
name: new-component
description: Crea un nuovo componente React/Next.js rispettando i design token e le convenzioni del progetto Taverna Raphael
---

Crea un nuovo componente in `frontend/app/components/<NomeComponente>.jsx`.

## Argomenti
$ARGUMENTS — nome del componente e breve descrizione dello scopo.

## Regole obbligatorie

### Struttura file
- Aggiungi `'use client'` solo se il componente usa hook, event handler, o API browser
- Default export con nome PascalCase corrispondente al nome file
- Stili sempre in `<style jsx>{``}</style>` dentro il return — mai CSS separato

### Design token — usa SOLO questi, mai valori hardcoded

**Colori** (tema notturno / ottone)
- `var(--color-ink)` — sfondo pagina
- `var(--color-ink-light)` — sfondo sezioni alternate, pannelli admin
- `var(--color-paper)` — testo primario, sfondo ticket
- `var(--color-paper-dim)` — variante testo su `--color-paper`
- `var(--color-brass)` — bordi, fill CTA
- `var(--color-brass-bright)` — accenti, underline, eyebrow, hover, focus ring
- `var(--color-rust)` — dettagli decorativi (timbri, accenti)
- `var(--color-text-soft)` — testo secondario/descrizioni
- `var(--color-text-dim)` — testo terziario, label
- `var(--color-line)` — bordi sottili (rgba ottone 18%)
- `var(--color-line-strong)` — bordi evidenti (rgba ottone 25%)
- `var(--color-success/warning/danger)` — solo admin/feedback, desaturati per fondo scuro

**Tipografia**
- `var(--font-display)` — Fraunces italic, per heading H1-H3
- `var(--font-body)` — Inter, per tutto il resto
- `var(--font-mono)` — IBM Plex Mono, per eyebrow, prezzi, orari, dati tabellari
- Scale font: `var(--fs-eyebrow)`, `var(--fs-body)`, `var(--fs-lead)`, `var(--fs-h3)`, `var(--fs-h2)`, `var(--fs-h1)`

**Spacing** (sistema 4/8)
- `var(--s-2)` 0.5rem · `var(--s-4)` 1rem · `var(--s-6)` 1.5rem · `var(--s-8)` 2rem
- `var(--s-12)` 3rem · `var(--s-16)` 4rem · `var(--s-24)` 6rem

**Altro**
- Border radius: `var(--r-sm)` 2px, `var(--r-md)` 4px
- Shadow: `var(--shadow-raise)`
- Transizioni: `var(--dur-fast)` 180ms, `var(--dur-base)` 300ms, `var(--ease)`

### Icone e grafica
- Solo SVG inline — mai librerie icone esterne
- Niente emoji come icone UI

### Classi utility globali disponibili
- `.eyebrow` — label uppercase mono, colore ottone, con trattino decorativo
- `.divider-line` — linea 1px × 48px ottone
- `.btn` — CTA fill ottone
- `.btn-ghost` — CTA outline ottone
- `.container` — max-width 1180px con padding laterale
- `.section` — padding verticale standard

### Accessibilità
- `aria-label` su tutti i bottoni icon-only
- `alt` descrittivo su tutte le immagini
- Focus ring: `:focus-visible { outline: 2px solid var(--color-brass-bright); outline-offset: 2px; }`
- Animazioni: rispetta sempre `@media (prefers-reduced-motion: reduce)`

### Responsive
- Mobile-first, breakpoint principali: 640px, 768px, 1024px
- Niente overflow orizzontale
- Touch target minimo 44×44px per elementi interattivi
