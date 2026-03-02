import { useState, useRef } from "react";

function VideoCard({ video }) {
    const [playing, setPlaying] = useState(false);
    const videoRef = useRef(null);

    const handlePlayClick = () => {
        if (!playing) {
            setPlaying(true);
            // Kleiner Timeout, damit das Video erst im DOM ist
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.play()
                        .then(() => console.log("Video spielt"))
                        .catch(err => console.error("Fehler beim Abspielen:", err));
                }
            }, 100);
        } else {
            // Video pausieren und Thumbnail wieder anzeigen
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
            setPlaying(false);
        }
    };

    return (
        <div className="video-card">
            <div className="video-placeholder" onClick={handlePlayClick}>
                {!playing ? (
                    <>
                        <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="placeholder-img"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div className="play-overlay">▶</div>
                    </>
                ) : (
                    <video
                        ref={videoRef}
                        src={video.videoUrl}
                        controls
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => console.error("Video-Fehler:", e)}
                    />
                )}
            </div>
            <h3>{video.title}</h3>
            <p>{video.text}</p>
        </div>
    );
}

export default VideoCard;