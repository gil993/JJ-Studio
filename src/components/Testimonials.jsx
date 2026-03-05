import { useState } from "react";
import "../styles/testimonials.css";

function Testimonials({ testimonials = [] }) {
    const [page, setPage] = useState(1);
    const perPage = 3;

    const totalPages = Math.ceil(testimonials.length / perPage);
    const currentTestimonials = testimonials.slice(
        (page - 1) * perPage,
        page * perPage
    );

    return (
        <section id="testimonials" className="testimonials-section">
            <div className="container">
                <h2 className="section-title">Kundenstimmen</h2>

                <div className="testimonials-grid">
                    {currentTestimonials.map(t => (
                        <div key={t.id} className="testimonial-card">
                            <p>"{t.text}"</p>
                            <p className="testimonial-author">— {t.author}</p>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="pagination testimonials-pagination">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="pagination-btn"
                        >
                            ← Zurück
                        </button>
                        <div className="pagination-pages">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                                <button
                                    key={num}
                                    onClick={() => setPage(num)}
                                    className={`page-btn ${page === num ? 'active' : ''}`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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

export default Testimonials;