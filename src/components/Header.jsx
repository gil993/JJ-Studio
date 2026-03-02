import { useState } from "react";
import "../styles/header.css";

function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="site-header">
            <div className="container header-container">
                <div className="logo">
                    <a href="#home">JJ-Studios</a>
                </div>

                {/* Burger Button */}
                <button
                    className={`burger-btn ${isOpen ? 'open' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Navigation */}
                <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
                    <ul>
                        <li><a href="#work" onClick={() => setIsOpen(false)}>Work</a></li>
                        <li><a href="#about" onClick={() => setIsOpen(false)}>About</a></li>
                        <li><a href="#testimonials" onClick={() => setIsOpen(false)}>Testimonials</a></li>
                        <li><a href="#contact" onClick={() => setIsOpen(false)}>Contact</a></li>
                    </ul>
                </div>

                {/* Overlay */}
                {isOpen && <div className="overlay" onClick={() => setIsOpen(false)}></div>}
            </div>
        </header>
    );
}

export default Header;