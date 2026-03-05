import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Work from "./components/Work";
import About from "./components/About";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import "./styles/responsive.css";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [videos, setVideos] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Daten beim Start laden ──
    useEffect(() => {
        async function loadData() {
            const [{ data: vids }, { data: testi }] = await Promise.all([
                supabase.from("videos").select("*").order("created_at", { ascending: true }),
                supabase.from("testimonials").select("*").order("created_at", { ascending: true }),
            ]);
            if (vids) setVideos(vids);
            if (testi) setTestimonials(testi);
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh", background: "#0a0a0a",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#d4a373", fontSize: "1.2rem", fontFamily: "sans-serif"
            }}>
                Laden...
            </div>
        );
    }

    if (isLoggedIn) {
        return (
            <AdminDashboard
                videos={videos}
                setVideos={setVideos}
                testimonials={testimonials}
                setTestimonials={setTestimonials}
                onLogout={() => setIsLoggedIn(false)}
            />
        );
    }

    return (
        <>
            <Header />
            <Hero />
            <Work videos={videos} />
            <About />
            <Testimonials testimonials={testimonials} />
            <Contact />
            <Footer onLoginClick={() => setShowLogin(true)} />

            {showLogin && (
                <AdminLogin
                    onLogin={() => { setIsLoggedIn(true); setShowLogin(false); }}
                    onClose={() => setShowLogin(false)}
                />
            )}
        </>
    );
}

export default App;