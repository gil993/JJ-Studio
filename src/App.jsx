import Header from "./components/Header";
import Hero from "./components/Hero";
import Work from "./components/Work";
import About from "./components/About";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import "./styles/responsive.css";

function App() {
    return (
        <>
            <Header />
            <Hero />
            <Work />
            <About />
            <Testimonials />
            <Contact />
            <Footer />
        </>
    );
}

export default App;