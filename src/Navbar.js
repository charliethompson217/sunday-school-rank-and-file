import React, { useState, useEffect, useRef } from "react";
import logo from './assets/Favicon.svg';
import './NavBar.css';
import { Link } from "react-router-dom";
export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navbarRef = useRef(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navbarRef.current && !navbarRef.current.contains(event.target)) {
                closeMenu();
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);
    
    return (
        <nav ref={navbarRef} className={`navbar ${isMenuOpen ? 'open' : ''}`}>
            <div className="navbar-container">
                <div className="navbar-brand">
                    <img src={logo} alt="Logo" />
                    <h1 className="unbold">Sunday School Rank and File</h1>
                </div>
                <button className="menu-button" onClick={toggleMenu}>
                    <span className="menu-icon"></span>
                </button>
                <ul className="navbar-menu">
                    <li><Link to={"/"} className="lighter-text">Home</Link></li>
                    <li><Link to={"/rules"}>Rules</Link></li>
                    <li><Link to={"/results"}>Picks & Results</Link></li>
                    <li><Link to={"/submitpicks"}>Submit Picks</Link></li>
                </ul>
            </div>
        </nav>
    );
}
