import React, { useState, useEffect, useRef } from "react";
import { Auth, Amplify } from 'aws-amplify';
import jwtDecode from 'jwt-decode';
import awsconfig from './aws-exports';
import logo from './assets/Favicon.svg';
import './NavBar.css';
import { Link } from "react-router-dom";

Amplify.configure(awsconfig);

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navbarRef = useRef(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const checkAuthState = async () => {
        try {
            const currentUser = await Auth.currentAuthenticatedUser();
            const idToken = currentUser.signInUserSession.idToken.jwtToken;
            const decodedToken = jwtDecode(idToken);

            if (decodedToken['cognito:groups'] && decodedToken['cognito:groups'].includes('Admin')) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        } catch (error) {
            return;
        }
    };

    useEffect(() => {
        checkAuthState();
    }, []);

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
                <Link to={"/"} className="navbar-brand">
                    <img src={logo} alt="Logo" />
                </Link>
                <Link to={"/"}>
                    <h1 className="unbold">Sunday School Rank and File</h1>
                </Link>
                <button className="menu-button" onClick={toggleMenu}>
                    <span className="menu-icon"></span>
                </button>
                <ul className="navbar-menu">
                    <Link to={"/submitpicks"}><li>Submit Picks</li></Link>
                    <Link to={"/results"}><li>Picks & Results</li></Link>
                    <Link to={"/account"}><li>Account</li></Link>
                    <Link to={"/rules"}><li>Rules</li></Link>
                    {isAdmin ? (
                        <Link to={"/admin"}><li>Admin</li></Link>
                    ) : (<></>)}
                </ul>
            </div>
        </nav>
    );
};