import React, { useState, useEffect } from 'react';
import {Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import './App.css';
import Countdown from './Countdown';
import Navbar from './Navbar';
import logo from './assets/logo.svg';

Amplify.configure(awsExports);

export default function Home({matchupsResponse}) {
  const [closeTime, setCloseTime] = useState("");
  const [week, setWeek] = useState("Week");

  useEffect(() => {
    const fetchCloseTime = async () => {
      try {
        const {closeTime: fetchedCloseTime, week:fetchedWeek} = matchupsResponse;
        setCloseTime(fetchedCloseTime);
        setWeek(fetchedWeek);
      } catch (error) {
        console.error('Error fetching matchups:', error);
      }
    };
    fetchCloseTime();
  }, [matchupsResponse]);
  return (
    <>
        <Navbar></Navbar>
        <div className='navbar-offset-container'>
          <div className='home-screen'>
            <div className="main-logo">
              <img className="homeLogo" src={logo} alt="Logo" />
            </div>
            <div className="countdown-container">
              <h1>Sunday School {week} Kicks Off In:</h1>
              <Countdown targetDate={closeTime} />
            </div>
          </div>
        </div>
    </>
  )
}
