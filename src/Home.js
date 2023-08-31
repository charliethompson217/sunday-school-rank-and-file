import React from 'react';
import Navbar from './Navbar';
import Countdown from './Countdown';
import logo from './assets/logo.svg';
import './App.css';
export default function Home() {
  const targetDate = new Date('2023-09-10T17:00:00Z');
  return (
    <>
        <Navbar></Navbar>
        <div className='navbar-offset-container'>
          <div className='home-screen'>
            <div className="main-logo">
              <img className="homeLogo" src={logo} alt="Logo" />
            </div>
            <div className="countdown-container">
              <h1>2023–24 Season Kicks Off in:</h1>
              <Countdown targetDate={targetDate} />
            </div>
          </div>
        </div>
    </>
  )
}
