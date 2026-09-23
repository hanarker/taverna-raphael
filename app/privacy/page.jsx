// TODO(cliente): sostituire con il testo definitivo dell'informativa privacy (a cura del cliente/consulente).
// Il form di prenotazione rimanda già a questa pagina e registra il consenso con data/ora e versione.
export const metadata = { title: 'Informativa privacy — Taverna Raphael' };

export default function PrivacyPage() {
    return (
        <>
            <div className="page-hero">
                <div className="container page-hero-inner">
                    <span className="eyebrow">Informativa</span>
                    <h1>Privacy</h1>
                    <div className="divider-line" aria-hidden="true" />
                </div>
            </div>
            <div className="section container">
                <p>
                    L&apos;informativa sul trattamento dei dati personali è in fase di pubblicazione.
                    Per informazioni o per esercitare i tuoi diritti, contattaci al +39 366 357 5967.
                </p>
            </div>
        </>
    );
}
