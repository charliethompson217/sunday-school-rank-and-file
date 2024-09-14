import React, { useState, useEffect, useContext } from 'react';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import './App.css';
import Countdown from './Countdown';
import Navbar from './Navbar';
import logo from './assets/logo.svg';
import { DataContext } from './DataContext';

Amplify.configure(awsExports);

export default function Home() {
  const { fetchedCurWeek, fetchedMatchupsResponse} = useContext(DataContext);
  const [closeTime, setCloseTime] = useState("");
  const [week, setWeek] = useState("Week");

  useEffect(() => {
    const {closeTime: fetchedCloseTime, week:fetchedWeek} = fetchedMatchupsResponse;
    setCloseTime(fetchedCloseTime);
    setWeek(fetchedWeek);
  }, [fetchedCurWeek, fetchedMatchupsResponse]);

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