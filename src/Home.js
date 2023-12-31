import React, { useState, useEffect } from 'react';
import { API, Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import './App.css';
import Countdown from './Countdown';
import Navbar from './Navbar';
import logo from './assets/logo.svg';

Amplify.configure(awsExports);

export default function Home() {
  const [closeTime, setCloseTime] = useState("");
  const [week, setWeek] = useState("Week");

  useEffect(() => {
    const fetchCloseTime = async () => {
      try {
        const curWeek = await API.get('sundaySchoolConfiguration', '/configuration/get-current-week');
        const response = await API.put('sundaySchoolConfiguration', '/configuration/matchups',{
            body: {
                week: `${curWeek}`,
            },
        });
        const {closeTime: fetchedCloseTime, week:fetchedWeek} = response;
        setCloseTime(fetchedCloseTime);
        setWeek(fetchedWeek);
      } catch (error) {
        console.error('Error fetching matchups:', error);
      }
    };
    fetchCloseTime();
  }, []);
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