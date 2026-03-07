import { useState } from "react";
import "../styles/footer.css";

function ImpressumModal({ onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Impressum</h2>
                <p>
                    <strong>JJ-Studios</strong><br />
                    Jon Tuba<br />
                    Schweiz<br /><br />
                    <strong>Kontakt</strong><br />
                    E-Mail: kontakt@jj-studios.ch<br /><br />
                    <strong>Haftungsausschluss</strong><br />
                    Alle Inhalte dieser Website wurden sorgfältig geprüft.
                    Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
                    kann keine Gewähr übernommen werden.<br /><br />
                    <strong>Urheberrecht</strong><br />
                    Die auf dieser Website veröffentlichten Inhalte und Werke unterliegen
                    dem Urheberrecht. © 2025 Jon Tuba | JJ-Studios
                </p>
                <br/>
                <br/>
                <button className="btn btn-primary modal-close-btn" onClick={onClose}>
                    Schliessen
                </button>
            </div>
        </div>
    );
}

function Footer({ onLoginClick }) {
    const [showImpressum, setShowImpressum] = useState(false);

    return (
        <>
            <footer className="site-footer">
                <div className="container footer-inner">
                    <span>© 2025 Jon Tuba | JJ-Studios</span>
                    <div className="footer-links">
                        <button
                            className="footer-link-btn impressum-btn"
                            onClick={() => setShowImpressum(true)}
                        >
                            Impressum
                        </button>
                        <button
                            className="footer-link-btn anmelden-btn"
                            onClick={onLoginClick}
                        >
                            Anmelden
                        </button>
                    </div>
                </div>
            </footer>

            {showImpressum && (
                <ImpressumModal onClose={() => setShowImpressum(false)} />
            )}
        </>
    );
}

export default Footer;