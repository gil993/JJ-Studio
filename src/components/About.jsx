import "../styles/about.css";

function About() {
    return (
        <section id="about" className="about-section">
            <div className="container">
                <h2 className="section-title">Über mich</h2>

                <div className="about-grid">
                    {/* Foto links */}
                    <div className="about-image">
                        <div className="image-placeholder">
                            <div className="placeholder-content">
                                <span className="photo-icon">📷</span>
                                <p>Jon Tuba Portrait</p>
                            </div>
                        </div>
                    </div>

                    {/* Text rechts */}
                    <div className="about-content">
                        <p>
                            Ich bin <span className="highlight">Jon Tuba</span>, 19 Jahre alter Videograf aus der Schweiz.
                            Schon früh habe ich meine Leidenschaft für visuelle Geschichten entdeckt und
                            mache jetzt das, was ich liebe: Momente einfangen und in bewegte Bilder verwandeln.
                        </p>

                        <p>
                            Mit meiner Kamera war ich bereits an verschiedenen Events unterwegs – von
                            energiegeladenen Aftermovies über emotionale Musikvideos bis hin zu professionellen
                            Business-Clips. Dabei ist mir eines besonders wichtig: <strong>Authentizität</strong>.
                        </p>

                        <p>
                            Ich glaube daran, dass jedes Projekt eine einzigartige Geschichte hat, die darauf wartet,
                            erzählt zu werden. Egal ob Grossanlass oder intimes Shooting – ich bringe frische Ideen,
                            technisches Know-how und vor allem ganz viel Herzblut mit.
                        </p>

                        <blockquote>
                            "Videos sind für mich mehr als nur bewegte Bilder – sie sind Emotionen, Erinnerungen
                            und die beste Art, Geschichten zu erzählen."
                        </blockquote>

                        <div className="about-stats">
                            <div className="stat-item">
                                <span className="stat-number">50+</span>
                                <span className="stat-label">Projekte</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">3</span>
                                <span className="stat-label">Jahre Erfahrung</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">100%</span>
                                <span className="stat-label">Leidenschaft</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default About;