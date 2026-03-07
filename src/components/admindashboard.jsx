import { useState, useRef } from "react";
import { supabase } from "../supabase";
import "../styles/admin.css";

const CATEGORIES = ["Ski", "aftermovie", "social", "business"];

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

// ─── Thumbnail Upload zu Supabase Storage ─────────────────────────────────────
async function uploadThumbnail(file) {
    const ext = file.name.split(".").pop();
    const filename = `thumb_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
        .from("thumbnails")
        .upload(filename, file, { upsert: true });
    if (error) { alert("Upload-Fehler: " + error.message); return null; }
    const { data } = supabase.storage.from("thumbnails").getPublicUrl(filename);
    return data.publicUrl;
}

// ─── Thumbnail Drop Zone (mit Storage Upload) ─────────────────────────────────
function ThumbDropZone({ value, onChange }) {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    const handleFile = async (file) => {
        if (!file || !file.type.startsWith("image/")) return;
        setUploading(true);
        const url = await uploadThumbnail(file);
        if (url) onChange(url);
        setUploading(false);
    };

    return (
        <div
            className={`thumb-dropzone ${dragging ? "dragging" : ""} ${value ? "has-image" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => !uploading && fileRef.current?.click()}
        >
            {uploading ? (
                <div className="thumb-dropzone-placeholder">
                    <span className="thumb-drop-icon">⏳</span>
                    <span className="thumb-drop-text">Wird hochgeladen...</span>
                </div>
            ) : value ? (
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
        video || { title: "", text: "", category: "Ski", videoUrl: "", thumbnail: "", is_showreel: false }
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

                {/* Showreel Toggle */}
                <div className="showreel-toggle" onClick={() => set("is_showreel", !form.is_showreel)}>
                    <div className={`toggle-switch ${form.is_showreel ? "on" : ""}`}>
                        <div className="toggle-knob" />
                    </div>
                    <span className="toggle-label">Als Hero-Showreel festlegen</span>
                </div>

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
        if (!form.text.trim() || !form.author.trim()) { alert("Text und Autor sind Pflicht!"); return; }
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
                          onChange={(e) => set("text", e.target.value)} placeholder="Was hat der Kunde gesagt?" rows={4} />
                <label className="admin-label">Autor *</label>
                <input className="admin-input" value={form.author}
                       onChange={(e) => set("author", e.target.value)} placeholder="z.B. Noah, RapCity" />
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

// ─── Drag & Drop sortable video row ──────────────────────────────────────────
function SortableRow({ video, index, onDragStart, onDragOver, onDrop, onEdit, onDelete, onShowreel }) {
    return (
        <tr
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
            onDrop={onDrop}
            className="sortable-row"
        >
            <td style={{ cursor: "grab", color: "#555", paddingRight: 0, fontSize: "1.2rem" }}>⠿</td>
            <td>
                {video.thumbnail
                    ? <img src={video.thumbnail} alt="" className="admin-thumb" onError={(e) => e.target.style.display = "none"} />
                    : <div className="admin-thumb admin-thumb-empty">▶</div>}
            </td>
            <td>
                <div className="admin-video-title">
                    {video.is_showreel && <span className="showreel-badge">★ Showreel</span>}
                    {video.title}
                </div>
                <div className="admin-video-text">{video.text}</div>
            </td>
            <td><span className={`admin-badge admin-badge-${video.category}`}>{video.category}</span></td>
            <td>
                <span className={`admin-platform admin-platform-${video.type}`}>
                    {video.type === "youtube" ? "▶ YouTube" : video.type === "vimeo" ? "◉ Vimeo" : "?"}
                </span>
            </td>
            <td>
                <a href={video.videoUrl} target="_blank" rel="noreferrer" className="admin-url-link">
                    {video.videoUrl?.length > 32 ? video.videoUrl.slice(0, 32) + "…" : video.videoUrl}
                </a>
            </td>
            <td>
                <div className="admin-actions">
                    <button className="admin-btn-showreel" onClick={() => onShowreel(video)}
                            title={video.is_showreel ? "Showreel entfernen" : "Als Showreel setzen"}>
                        {video.is_showreel ? "★" : "☆"}
                    </button>
                    <button className="admin-btn-edit" onClick={() => onEdit(video)}>✏</button>
                    <button className="admin-btn-danger" onClick={() => onDelete(video.id)}>🗑</button>
                </div>
            </td>
        </tr>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ videos, setVideos, testimonials, setTestimonials, onLogout }) {
    const [view, setView] = useState("dashboard");
    const [videoModal, setVideoModal] = useState(null);
    const [testimonialModal, setTestimonialModal] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const dragIndex = useRef(null);
    const hoverIndex = useRef(null);

    // ── Video CRUD ──
    const saveVideo = async (v) => {
        if (v.id) {
            if (v.is_showreel) {
                // Erst alle anderen auf false setzen
                await supabase.from("videos").update({ is_showreel: false }).neq("id", v.id);
                setVideos((prev) => prev.map((x) => ({ ...x, is_showreel: x.id === v.id ? true : false })));
            }
            const { data, error } = await supabase
                .from("videos")
                .update({ title: v.title, text: v.text, category: v.category, thumbnail: v.thumbnail, videoUrl: v.videoUrl, type: v.type, is_showreel: v.is_showreel })
                .eq("id", v.id).select().single();
            if (!error) setVideos((prev) => prev.map((x) => (x.id === v.id ? data : x)));
        } else {
            if (v.is_showreel) {
                await supabase.from("videos").update({ is_showreel: false }).gte("id", 0);
            }
            const { data, error } = await supabase
                .from("videos")
                .insert({ title: v.title, text: v.text, category: v.category, thumbnail: v.thumbnail, videoUrl: v.videoUrl, type: v.type, is_showreel: v.is_showreel, sort_order: videos.length })
                .select().single();
            if (!error) setVideos((prev) => [...prev, data]);
        }
        setVideoModal(null);
    };

    const deleteVideo = async (id) => {
        await supabase.from("videos").delete().eq("id", id);
        setVideos((prev) => prev.filter((v) => v.id !== id));
        setDeleteTarget(null);
    };

    const toggleShowreel = async (video) => {
        const newVal = !video.is_showreel;
        if (newVal) await supabase.from("videos").update({ is_showreel: false }).neq("id", video.id);
        await supabase.from("videos").update({ is_showreel: newVal }).eq("id", video.id);
        setVideos((prev) => prev.map((v) => ({ ...v, is_showreel: v.id === video.id ? newVal : (newVal ? false : v.is_showreel) })));
    };

    // ── Drag & Drop sort ──
    const handleDragStart = (index) => { dragIndex.current = index; };
    const handleDragOver = (index) => { hoverIndex.current = index; };
    const handleDrop = async () => {
        const from = dragIndex.current;
        const to = hoverIndex.current;
        if (from === null || to === null || from === to) return;
        const reordered = [...videos];
        const [moved] = reordered.splice(from, 1);
        reordered.splice(to, 0, moved);
        // Update sort_order in DB
        await Promise.all(reordered.map((v, i) =>
            supabase.from("videos").update({ sort_order: i }).eq("id", v.id)
        ));
        setVideos(reordered);
        dragIndex.current = null;
        hoverIndex.current = null;
    };

    // ── Testimonial CRUD ──
    const saveTestimonial = async (t) => {
        if (t.id) {
            const { data, error } = await supabase.from("testimonials")
                .update({ text: t.text, author: t.author }).eq("id", t.id).select().single();
            if (!error) setTestimonials((prev) => prev.map((x) => (x.id === t.id ? data : x)));
        } else {
            const { data, error } = await supabase.from("testimonials")
                .insert({ text: t.text, author: t.author }).select().single();
            if (!error) setTestimonials((prev) => [...prev, data]);
        }
        setTestimonialModal(null);
    };

    const deleteTestimonial = async (id) => {
        await supabase.from("testimonials").delete().eq("id", id);
        setTestimonials((prev) => prev.filter((t) => t.id !== id));
        setDeleteTarget(null);
    };

    const stats = [
        { num: videos.length, label: "Videos gesamt" },
        { num: videos.filter((v) => v.category === "Ski").length, label: "Ski" },
        { num: videos.filter((v) => v.category === "business").length, label: "Business" },
        { num: testimonials.length, label: "Kommentare" },
    ];

    const NAV = [
        { id: "dashboard", icon: "📊", label: "Dashboard" },
        { id: "videos", icon: "🎬", label: "Videos" },
        { id: "testimonials", icon: "💬", label: "Kommentare" },
    ];

    return (
        <div className="admin-layout">
            {/* Mobile burger */}
            <button className="admin-mobile-burger" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? "✕" : "☰"}
            </button>

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
                <div className="admin-sidebar-logo">JJ-Studios</div>
                {NAV.map((item) => (
                    <button key={item.id}
                            className={`admin-nav-item ${view === item.id ? "active" : ""}`}
                            onClick={() => { setView(item.id); setSidebarOpen(false); }}>
                        {item.icon} {item.label}
                    </button>
                ))}
                <div className="admin-sidebar-bottom">
                    <button className="admin-btn-cancel" onClick={onLogout}>↩ Abmelden</button>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

            <main className="admin-main">

                {/* DASHBOARD */}
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
                                            <div className="admin-recent-title">
                                                {v.is_showreel && <span className="showreel-badge">★</span>} {v.title}
                                            </div>
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

                {/* VIDEOS */}
                {view === "videos" && (
                    <>
                        <div className="admin-topbar">
                            <h1 className="admin-page-title">Videos verwalten</h1>
                            <button className="btn btn-primary" onClick={() => setVideoModal("add")}>+ Neues Video</button>
                        </div>
                        <p className="drag-hint">⠿ Zeilen ziehen zum Sortieren · ☆ Als Showreel setzen</p>
                        <div className="admin-card">
                            <table className="admin-table">
                                <thead>
                                <tr>
                                    <th></th>
                                    <th>Thumb</th>
                                    <th>Titel</th>
                                    <th>Kategorie</th>
                                    <th>Plattform</th>
                                    <th>URL</th>
                                    <th>Aktionen</th>
                                </tr>
                                </thead>
                                <tbody>
                                {videos.map((v, i) => (
                                    <SortableRow key={v.id} video={v} index={i}
                                                 onDragStart={handleDragStart}
                                                 onDragOver={handleDragOver}
                                                 onDrop={handleDrop}
                                                 onEdit={(v) => setVideoModal(v)}
                                                 onDelete={(id) => setDeleteTarget({ type: "video", id })}
                                                 onShowreel={toggleShowreel}
                                    />
                                ))}
                                </tbody>
                            </table>
                            {videos.length === 0 && <p className="admin-empty">Noch keine Videos.</p>}
                        </div>
                    </>
                )}

                {/* TESTIMONIALS */}
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
                <VideoModal video={videoModal === "add" ? null : videoModal}
                            onSave={saveVideo} onClose={() => setVideoModal(null)} />
            )}
            {testimonialModal && (
                <TestimonialModal testimonial={testimonialModal === "add" ? null : testimonialModal}
                                  onSave={saveTestimonial} onClose={() => setTestimonialModal(null)} />
            )}
            {deleteTarget && (
                <DeleteConfirm
                    onConfirm={() => deleteTarget.type === "video"
                        ? deleteVideo(deleteTarget.id)
                        : deleteTestimonial(deleteTarget.id)}
                    onClose={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}

export default AdminDashboard;