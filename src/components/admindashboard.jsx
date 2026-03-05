import { useState, useRef } from "react";
import { supabase } from "../supabase";
import "../styles/admin.css";

const CATEGORIES = ["Ski", "aftermovie", "social", "business"];

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────
function getYoutubeId(url) {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? match[1] : null;
}
function getVimeoId(url) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
}
function detectType(url) {
    if (!url) return "unknown";
    if (url.includes("youtube") || url.includes("youtu.be")) return "youtube";
    if (url.includes("vimeo")) return "vimeo";
    return "unknown";
}
function autoThumb(url) {
    const id = getYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : "";
}

// ─── Embed Preview ────────────────────────────────────────────────────────────
function EmbedPreview({ url }) {
    const type = detectType(url);
    if (type === "youtube") {
        return <iframe src={`https://www.youtube.com/embed/${getYoutubeId(url)}`}
                       className="embed-preview" allow="autoplay; fullscreen" allowFullScreen title="YouTube" />;
    }
    if (type === "vimeo") {
        return <iframe src={`https://player.vimeo.com/video/${getVimeoId(url)}`}
                       className="embed-preview" allow="autoplay; fullscreen" allowFullScreen title="Vimeo" />;
    }
    return <p className="embed-unknown">Unbekannte Video-URL</p>;
}

// ─── Thumbnail Drag & Drop Zone ───────────────────────────────────────────────
function ThumbDropZone({ value, onChange }) {
    const [dragging, setDragging] = useState(false);
    const fileRef = useRef(null);
    const handleFile = (file) => {
        if (!file || !file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => onChange(e.target.result);
        reader.readAsDataURL(file);
    };
    return (
        <div
            className={`thumb-dropzone ${dragging ? "dragging" : ""} ${value ? "has-image" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
        >
            {value ? (
                <>
                    <img src={value} alt="Thumbnail" className="thumb-dropzone-img" />
                    <div className="thumb-dropzone-overlay"><span>📷 Bild ersetzen</span></div>
                </>
            ) : (
                <div className="thumb-dropzone-placeholder">
                    <span className="thumb-drop-icon">🖼</span>
                    <span className="thumb-drop-text">Bild hier reinziehen</span>
                    <span className="thumb-drop-sub">oder klicken zum Auswählen</span>
                </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                   onChange={(e) => handleFile(e.target.files[0])} />
        </div>
    );
}

// ─── Video Modal ──────────────────────────────────────────────────────────────
function VideoModal({ video, onSave, onClose }) {
    const [form, setForm] = useState(
        video || { title: "", text: "", category: "Ski", videoUrl: "", thumbnail: "" }
    );
    const [saving, setSaving] = useState(false);
    const [thumbAutoSet, setThumbAutoSet] = useState(false);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleUrlChange = (v) => {
        set("videoUrl", v);
        if (!thumbAutoSet && detectType(v) === "youtube") {
            const t = autoThumb(v);
            if (t) { set("thumbnail", t); setThumbAutoSet(true); }
        }
    };

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.videoUrl.trim()) {
            alert("Titel und Video-URL sind Pflicht!");
            return;
        }
        setSaving(true);
        await onSave({ ...form, type: detectType(form.videoUrl) });
        setSaving(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box admin-modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">{video ? "Video bearbeiten" : "Neues Video"}</h2>

                <label className="admin-label">Titel *</label>
                <input className="admin-input" value={form.title}
                       onChange={(e) => set("title", e.target.value)} placeholder="Video-Titel" />

                <label className="admin-label">Beschreibung</label>
                <input className="admin-input" value={form.text}
                       onChange={(e) => set("text", e.target.value)} placeholder="Kurzbeschreibung" />

                <label className="admin-label">Kategorie</label>
                <select className="admin-input admin-select" value={form.category}
                        onChange={(e) => set("category", e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>

                <label className="admin-label">YouTube / Vimeo URL *</label>
                <input className="admin-input" value={form.videoUrl}
                       onChange={(e) => handleUrlChange(e.target.value)}
                       placeholder="https://www.youtube.com/watch?v=... oder https://vimeo.com/..." />

                <label className="admin-label">Thumbnail</label>
                <ThumbDropZone value={form.thumbnail} onChange={(v) => set("thumbnail", v)} />

                {form.videoUrl && detectType(form.videoUrl) !== "unknown" && (
                    <div className="embed-wrap">
                        <label className="admin-label">Video-Vorschau</label>
                        <EmbedPreview url={form.videoUrl} />
                    </div>
                )}

                <div className="modal-actions">
                    <button className="admin-btn-cancel" onClick={onClose}>Abbrechen</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                        {saving ? "Speichern..." : "Speichern"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Testimonial Modal ────────────────────────────────────────────────────────
function TestimonialModal({ testimonial, onSave, onClose }) {
    const [form, setForm] = useState(testimonial || { text: "", author: "" });
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        if (!form.text.trim() || !form.author.trim()) {
            alert("Text und Autor sind Pflicht!");
            return;
        }
        setSaving(true);
        await onSave(form);
        setSaving(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">{testimonial ? "Kommentar bearbeiten" : "Neuer Kommentar"}</h2>

                <label className="admin-label">Kommentar *</label>
                <textarea className="admin-input admin-textarea" value={form.text}
                          onChange={(e) => set("text", e.target.value)}
                          placeholder="Was hat der Kunde gesagt?" rows={4} />

                <label className="admin-label">Autor *</label>
                <input className="admin-input" value={form.author}
                       onChange={(e) => set("author", e.target.value)}
                       placeholder="z.B. Noah, RapCity" />

                <div className="modal-actions">
                    <button className="admin-btn-cancel" onClick={onClose}>Abbrechen</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                        {saving ? "Speichern..." : "Speichern"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ onConfirm, onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box delete-box" onClick={(e) => e.stopPropagation()}>
                <div className="delete-icon">🗑</div>
                <h3 className="delete-title">Wirklich löschen?</h3>
                <p className="delete-sub">Diese Aktion kann nicht rückgängig gemacht werden.</p>
                <div className="modal-actions">
                    <button className="admin-btn-cancel" onClick={onClose}>Abbrechen</button>
                    <button className="admin-btn-danger-filled" onClick={onConfirm}>Löschen</button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ videos, setVideos, testimonials, setTestimonials, onLogout }) {
    const [view, setView] = useState("dashboard");
    const [videoModal, setVideoModal] = useState(null);
    const [testimonialModal, setTestimonialModal] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // ── Video CRUD ──────────────────────────────────────────────────────────────
    const saveVideo = async (v) => {
        if (v.id) {
            // Update
            const { data, error } = await supabase
                .from("videos")
                .update({ title: v.title, text: v.text, category: v.category, thumbnail: v.thumbnail, videoUrl: v.videoUrl, type: v.type })
                .eq("id", v.id)
                .select()
                .single();
            if (!error) setVideos((prev) => prev.map((x) => (x.id === v.id ? data : x)));
        } else {
            // Insert
            const { data, error } = await supabase
                .from("videos")
                .insert({ title: v.title, text: v.text, category: v.category, thumbnail: v.thumbnail, videoUrl: v.videoUrl, type: v.type })
                .select()
                .single();
            if (!error) setVideos((prev) => [...prev, data]);
        }
        setVideoModal(null);
    };

    const deleteVideo = async (id) => {
        const { error } = await supabase.from("videos").delete().eq("id", id);
        if (!error) setVideos((prev) => prev.filter((v) => v.id !== id));
        setDeleteTarget(null);
    };

    // ── Testimonial CRUD ────────────────────────────────────────────────────────
    const saveTestimonial = async (t) => {
        if (t.id) {
            // Update
            const { data, error } = await supabase
                .from("testimonials")
                .update({ text: t.text, author: t.author })
                .eq("id", t.id)
                .select()
                .single();
            if (!error) setTestimonials((prev) => prev.map((x) => (x.id === t.id ? data : x)));
        } else {
            // Insert
            const { data, error } = await supabase
                .from("testimonials")
                .insert({ text: t.text, author: t.author })
                .select()
                .single();
            if (!error) setTestimonials((prev) => [...prev, data]);
        }
        setTestimonialModal(null);
    };

    const deleteTestimonial = async (id) => {
        const { error } = await supabase.from("testimonials").delete().eq("id", id);
        if (!error) setTestimonials((prev) => prev.filter((t) => t.id !== id));
        setDeleteTarget(null);
    };

    const stats = [
        { num: videos.length, label: "Videos gesamt" },
        { num: videos.filter((v) => v.category === "Ski").length, label: "Ski" },
        { num: videos.filter((v) => v.category === "business").length, label: "Business" },
        { num: testimonials.length, label: "Kommentare" },
    ];

    const NAV = [
        { id: "dashboard",    icon: "📊", label: "Dashboard" },
        { id: "videos",       icon: "🎬", label: "Videos" },
        { id: "testimonials", icon: "💬", label: "Kommentare" },
    ];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-logo">JJ-Studios</div>
                {NAV.map((item) => (
                    <button key={item.id}
                            className={`admin-nav-item ${view === item.id ? "active" : ""}`}
                            onClick={() => setView(item.id)}>
                        {item.icon} {item.label}
                    </button>
                ))}
                <div className="admin-sidebar-bottom">
                    <button className="admin-btn-cancel" onClick={onLogout}>↩ Abmelden</button>
                </div>
            </aside>

            <main className="admin-main">

                {/* ── DASHBOARD ── */}
                {view === "dashboard" && (
                    <>
                        <div className="admin-topbar">
                            <h1 className="admin-page-title">Dashboard</h1>
                        </div>
                        <div className="admin-stats-grid">
                            {stats.map((s) => (
                                <div key={s.label} className="admin-stat-card">
                                    <span className="admin-stat-num">{s.num}</span>
                                    <span className="admin-stat-label">{s.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="dashboard-two-col">
                            <div className="admin-card">
                                <div className="admin-card-title">Letzte Videos</div>
                                {videos.slice(-4).reverse().map((v) => (
                                    <div key={v.id} className="admin-recent-row">
                                        {v.thumbnail
                                            ? <img src={v.thumbnail} alt="" className="admin-thumb" onError={(e) => e.target.style.display = "none"} />
                                            : <div className="admin-thumb admin-thumb-empty">▶</div>}
                                        <div>
                                            <div className="admin-recent-title">{v.title}</div>
                                            <div className="admin-recent-meta">{v.type?.toUpperCase()} · {v.category}</div>
                                        </div>
                                    </div>
                                ))}
                                {videos.length === 0 && <p className="admin-empty">Keine Videos.</p>}
                            </div>
                            <div className="admin-card">
                                <div className="admin-card-title">Letzte Kommentare</div>
                                {testimonials.slice(-4).reverse().map((t) => (
                                    <div key={t.id} className="admin-recent-row admin-recent-testimonial">
                                        <div className="admin-recent-title">"{t.text}"</div>
                                        <div className="admin-recent-meta">— {t.author}</div>
                                    </div>
                                ))}
                                {testimonials.length === 0 && <p className="admin-empty">Keine Kommentare.</p>}
                            </div>
                        </div>
                    </>
                )}

                {/* ── VIDEOS ── */}
                {view === "videos" && (
                    <>
                        <div className="admin-topbar">
                            <h1 className="admin-page-title">Videos verwalten</h1>
                            <button className="btn btn-primary" onClick={() => setVideoModal("add")}>+ Neues Video</button>
                        </div>
                        <div className="admin-card">
                            <table className="admin-table">
                                <thead>
                                <tr>
                                    <th>Thumbnail</th>
                                    <th>Titel</th>
                                    <th>Kategorie</th>
                                    <th>Plattform</th>
                                    <th>URL</th>
                                    <th>Aktionen</th>
                                </tr>
                                </thead>
                                <tbody>
                                {videos.map((v) => (
                                    <tr key={v.id}>
                                        <td>
                                            {v.thumbnail
                                                ? <img src={v.thumbnail} alt="" className="admin-thumb" onError={(e) => e.target.style.display = "none"} />
                                                : <div className="admin-thumb admin-thumb-empty">▶</div>}
                                        </td>
                                        <td>
                                            <div className="admin-video-title">{v.title}</div>
                                            <div className="admin-video-text">{v.text}</div>
                                        </td>
                                        <td><span className={`admin-badge admin-badge-${v.category}`}>{v.category}</span></td>
                                        <td>
                                                <span className={`admin-platform admin-platform-${v.type}`}>
                                                    {v.type === "youtube" ? "▶ YouTube" : v.type === "vimeo" ? "◉ Vimeo" : "?"}
                                                </span>
                                        </td>
                                        <td>
                                            <a href={v.videoUrl} target="_blank" rel="noreferrer" className="admin-url-link">
                                                {v.videoUrl?.length > 36 ? v.videoUrl.slice(0, 36) + "…" : v.videoUrl}
                                            </a>
                                        </td>
                                        <td>
                                            <div className="admin-actions">
                                                <button className="admin-btn-edit" onClick={() => setVideoModal(v)}>✏ Bearbeiten</button>
                                                <button className="admin-btn-danger" onClick={() => setDeleteTarget({ type: "video", id: v.id })}>🗑 Löschen</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {videos.length === 0 && <p className="admin-empty">Noch keine Videos.</p>}
                        </div>
                    </>
                )}

                {/* ── TESTIMONIALS ── */}
                {view === "testimonials" && (
                    <>
                        <div className="admin-topbar">
                            <h1 className="admin-page-title">Kommentare verwalten</h1>
                            <button className="btn btn-primary" onClick={() => setTestimonialModal("add")}>+ Neuer Kommentar</button>
                        </div>
                        <div className="testimonials-admin-grid">
                            {testimonials.map((t) => (
                                <div key={t.id} className="testimonial-admin-card">
                                    <p className="testimonial-admin-text">"{t.text}"</p>
                                    <p className="testimonial-admin-author">— {t.author}</p>
                                    <div className="testimonial-admin-actions">
                                        <button className="admin-btn-edit" onClick={() => setTestimonialModal(t)}>✏ Bearbeiten</button>
                                        <button className="admin-btn-danger" onClick={() => setDeleteTarget({ type: "testimonial", id: t.id })}>🗑 Löschen</button>
                                    </div>
                                </div>
                            ))}
                            {testimonials.length === 0 && <p className="admin-empty">Noch keine Kommentare.</p>}
                        </div>
                    </>
                )}
            </main>

            {videoModal && (
                <VideoModal
                    video={videoModal === "add" ? null : videoModal}
                    onSave={saveVideo}
                    onClose={() => setVideoModal(null)}
                />
            )}
            {testimonialModal && (
                <TestimonialModal
                    testimonial={testimonialModal === "add" ? null : testimonialModal}
                    onSave={saveTestimonial}
                    onClose={() => setTestimonialModal(null)}
                />
            )}
            {deleteTarget && (
                <DeleteConfirm
                    onConfirm={() =>
                        deleteTarget.type === "video"
                            ? deleteVideo(deleteTarget.id)
                            : deleteTestimonial(deleteTarget.id)
                    }
                    onClose={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}

export default AdminDashboard;