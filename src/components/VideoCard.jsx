import { useState, useRef } from "react";

function getYoutubeId(url) {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? match[1] : null;
}

function getVimeoId(url) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
}

function detectType(url) {
    if (!url) return "local";
    if (url.includes("youtube") || url.includes("youtu.be")) return "youtube";
    if (url.includes("vimeo")) return "vimeo";
    return "local";
}

function VideoCard({ video }) {
    const [playing, setPlaying] = useState(false);
    const videoRef = useRef(null);
    const type = detectType(video.videoUrl);

    const handlePlayClick = () => {
        if (type === "youtube" || type === "vimeo") {
            setPlaying(true);
            return;
        }
        // local file
        if (!playing) {
            setPlaying(true);
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.play().catch(err => console.error(err));
                }
            }, 100);
        } else {
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
            setPlaying(false);
        }
    };

    const renderMedia = () => {
        if (!playing) {
            return (
                <>
                    <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="placeholder-img"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div className="play-overlay">▶</div>
                </>
            );
        }

        if (type === "youtube") {
            const id = getYoutubeId(video.videoUrl);
            return (
                <iframe
                    src={`https://www.youtube.com/embed/${id}?autoplay=1`}
                    style={{ width: "100%", height: "100%", border: "none" }}
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    title={video.title}
                />
            );
        }

        if (type === "vimeo") {
            const id = getVimeoId(video.videoUrl);
            return (
                <iframe
                    src={`https://player.vimeo.com/video/${id}?autoplay=1`}
                    style={{ width: "100%", height: "100%", border: "none" }}
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    title={video.title}
                />
            );
        }

        // local
        return (
            <video
                ref={videoRef}
                src={video.videoUrl}
                controls
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={(e) => console.error("Video-Fehler:", e)}
            />
        );
    };

    return (
        <div className="video-card">
            <div
                className="video-placeholder"
                onClick={!playing ? handlePlayClick : undefined}
            >
                {renderMedia()}
            </div>
            <h3>{video.title}</h3>
            <p>{video.text}</p>
        </div>
    );
}

export default VideoCard;