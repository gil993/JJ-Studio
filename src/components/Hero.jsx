import { useState } from "react";
import "../styles/hero.css";

function getYoutubeId(url) {
    const match = url?.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? match[1] : null;
}
function getVimeoId(url) {
    const match = url?.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
}
function detectType(url) {
    if (!url) return "none";
    if (url.includes("youtube") || url.includes("youtu.be")) return "youtube";
    if (url.includes("vimeo")) return "vimeo";
    return "none";
}

function Hero({ showreel }) {
    const [playing, setPlaying] = useState(false);
    const type = detectType(showreel?.videoUrl);

    const renderMedia = () => {
        if (!showreel) {
            return (
                <div className="video-placeholder hero-placeholder">
                    <div className="placeholder-content">
                        <span className="play-icon">▶</span>
                        <p>Showreel</p>
                    </div>
                </div>
            );
        }

        if (!playing) {
            return (
                <div className="video-placeholder hero-placeholder" onClick={() => setPlaying(true)}>
                    {showreel.thumbnail
                        ? <img src={showreel.thumbnail} alt={showreel.title}
                               style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
                        : <div className="placeholder-content"><span className="play-icon">▶</span></div>
                    }
                    <div className="hero-play-btn">▶</div>
                </div>
            );
        }

        if (type === "youtube") {
            return (
                <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeId(showreel.videoUrl)}?autoplay=1`}
                    style={{ width: "100%", aspectRatio: "16/9", border: "none", borderRadius: 12 }}
                    allow="autoplay; fullscreen" allowFullScreen title="Showreel" />
            );
        }
        if (type === "vimeo") {
            return (
                <iframe
                    src={`https://player.vimeo.com/video/${getVimeoId(showreel.videoUrl)}?autoplay=1`}
                    style={{ width: "100%", aspectRatio: "16/9", border: "none", borderRadius: 12 }}
                    allow="autoplay; fullscreen" allowFullScreen title="Showreel" />
            );
        }
    };

    return (
        <section className="hero">
            <div className="container hero-grid">
                <div>
                    <h1>
                        Hey, ich heisse <span className="highlight">Jon Tuba</span>
                    </h1>
                    <p className="hero-subtitle">19 Jahre · Videograf · Schweiz</p>
                    <p>Aftermovies, Social Media & Business Videos für starke Marken.</p>
                    <a href="#contact" className="btn btn-primary">Jetzt melden</a>
                </div>
                <div className="hero-media">
                    {renderMedia()}
                </div>
            </div>
        </section>
    );
}

export default Hero;