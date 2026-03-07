import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
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
    const [session, setSession] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [videos, setVideos] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        async function loadData() {
            const [{ data: vids }, { data: testi }] = await Promise.all([
                supabase.from("videos").select("*").order("sort_order", { ascending: true }),
                supabase.from("testimonials").select("*").order("created_at", { ascending: true }),
            ]);
            if (vids) setVideos(vids);
            if (testi) setTestimonials(testi);
            setLoading(false);
        }
        loadData();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
    };

    const showreel = videos.find((v) => v.is_showreel) || null;

    if (loading) {
        return (
            <div className="app-loader">
                <div className="loader-logo">JJ</div>
                <div className="loader-bar"><div className="loader-fill" /></div>
            </div>
        );
    }

    if (session) {
        return (
            <AdminDashboard
                videos={videos}
                setVideos={setVideos}
                testimonials={testimonials}
                setTestimonials={setTestimonials}
                onLogout={handleLogout}
            />
        );
    }

    return (
        <>
            <Header />
            <Hero showreel={showreel} />
            <Work videos={videos} />
            <About />
            <Testimonials testimonials={testimonials} />
            <Contact />
            <Footer onLoginClick={() => setShowLogin(true)} />

            {showLogin && (
                <AdminLogin
                    onLogin={() => setShowLogin(false)}
                    onClose={() => setShowLogin(false)}
                />
            )}
        </>
    );
}

export default App;