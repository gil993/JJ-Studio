import { useState } from "react";
import { supabase } from "../supabase";
import "../styles/admin.css";

function AdminLogin({ onLogin, onClose }) {
    const [form, setForm] = useState({ email: "", pass: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!form.email || !form.pass) {
            setError("Bitte alle Felder ausfüllen.");
            return;
        }
        setLoading(true);
        setError("");

        const { error: authError } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.pass,
        });

        if (authError) {
            setError("Falsche E-Mail oder falsches Passwort.");
            setLoading(false);
        } else {
            onLogin();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box login-box" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Admin Login</h2>
                <p className="login-sub">JJ-Studios Backend</p>

                {error && <p className="login-error">{error}</p>}

                <label className="admin-label">E-Mail</label>
                <input
                    className="admin-input"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    autoFocus
                    placeholder="admin@jj-studios.ch"
                />

                <label className="admin-label">Passwort</label>
                <input
                    type="password"
                    className="admin-input"
                    value={form.pass}
                    onChange={(e) => setForm((f) => ({ ...f, pass: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />

                <button
                    className="btn btn-primary admin-submit-btn"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Anmelden..." : "Anmelden"}
                </button>
            </div>
        </div>
    );
}

export default AdminLogin;