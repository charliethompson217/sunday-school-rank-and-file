import React, { useState, useEffect, useContext } from 'react';
import Countdown from './Countdown';
import Navbar from './Navbar';
import logo from './assets/logo.svg';
import { DataContext } from './DataContext';


export default function Home() {
  const { fetchedCurWeek, fetchedMatchupsResponse } = useContext(DataContext);
  const [closeTime, setCloseTime] = useState("");
  const [week, setWeek] = useState();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const { closeTime: fetchedCloseTime, week: fetchedWeek } = fetchedMatchupsResponse;
    setCloseTime(fetchedCloseTime);
    setWeek(fetchedWeek);
  }, [fetchedCurWeek, fetchedMatchupsResponse]);

  return (
    <>
      <Navbar />
      <div className='navbar-offset-container'>
        <div className='home-screen'>
          <div className="main-logo">
            <img className="homeLogo" src={logo} alt="Logo" />
          </div>
          {week && (
            <div className="countdown-container">
              <h1>{week} Kicks Off In:</h1>
              <Countdown targetDate={closeTime} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};