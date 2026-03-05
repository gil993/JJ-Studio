import "../styles/admin.css";

const ADMIN_USER = "admin123";
const ADMIN_PASS = "Skifahren";

import { useState } from "react";

function AdminLogin({ onLogin, onClose }) {
    const [form, setForm] = useState({ user: "", pass: "" });
    const [error, setError] = useState("");

    const handleSubmit = () => {
        if (form.user === ADMIN_USER && form.pass === ADMIN_PASS) {
            onLogin();
        } else {
            setError("Falscher Benutzername oder Passwort.");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box login-box" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Admin Login</h2>
                <p className="login-sub">JJ-Studios Backend</p>

                {error && <p className="login-error">{error}</p>}

                <label className="admin-label">Benutzername</label>
                <input
                    className="admin-input"
                    value={form.user}
                    onChange={(e) => setForm((f) => ({ ...f, user: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    autoFocus
                />

                <label className="admin-label">Passwort</label>
                <input
                    type="password"
                    className="admin-input"
                    value={form.pass}
                    onChange={(e) => setForm((f) => ({ ...f, pass: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />

                <button className="btn btn-primary admin-submit-btn" onClick={handleSubmit}>
                    Anmelden
                </button>
            </div>
        </div>
    );
}

export default AdminLogin;