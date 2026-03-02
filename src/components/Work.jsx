import { useState } from "react";
import { videos } from "../data/videos";
import VideoCard from "./VideoCard";
import "../styles/work.css";

function Work() {
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);

    const perPage = 6;

    // Filter logic
    const filtered = filter === "all"
        ? videos
        : videos.filter(v => v.category === filter);

    const totalPages = Math.ceil(filtered.length / perPage);
    const currentVideos = filtered.slice(
        (page - 1) * perPage,
        page * perPage
    );

    // Filter ändern + Seite zurücksetzen
    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setPage(1);
    };

    // NEU: Page Change mit Scroll-to-top
    const handlePageChange = (newPage) => {
        setPage(newPage);
        // Sanft nach oben zur Work-Sektion scrollen
        setTimeout(() => {
            document.getElementById('work').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    };

    return (
        <section id="work" className="work-section">
            <div className="container">
                <h2 className="section-title">Ausgewählte Arbeiten</h2>

                {/* Filter Bar */}
                <div className="filter-bar">
                    {["all", "aftermovie", "social", "business"].map(f => (
                        <button
                            key={f}
                            className={`filter-btn ${filter === f ? "active" : ""}`}
                            onClick={() => handleFilterChange(f)}
                        >
                            {f === "all" ? "Alle" : f}
                        </button>
                    ))}
                </div>

                {/* Video Grid */}
                <div className="video-grid">
                    {currentVideos.map(video => (
                        <VideoCard key={video.id} video={video} />
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="pagination-btn"
                        >
                            ← Zurück
                        </button>

                        <div className="pagination-pages">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                                <button
                                    key={num}
                                    onClick={() => handlePageChange(num)}
                                    className={`page-btn ${page === num ? 'active' : ''}`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                            className="pagination-btn"
                        >
                            Weiter →
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Work;