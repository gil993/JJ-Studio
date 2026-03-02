import "../styles/hero.css";

function Hero() {
    return (
        <section className="hero">
            <div className="container hero-grid">
                <div>
                    <h1>
                        Hey, ich heisse <span className="highlight">Jon Tuba</span>
                    </h1>
                    <p className="hero-subtitle">
                        19 Jahre · Videograf · Schweiz
                    </p>
                    <p>
                        Aftermovies, Social Media & Business Videos für starke Marken.
                    </p>
                    <a href="#contact" className="btn btn-primary">
                        Jetzt melden
                    </a>
                </div>

                <div className="video-placeholder">
                    Showreel Placeholder
                </div>
            </div>
        </section>
    );
}

export default Hero;