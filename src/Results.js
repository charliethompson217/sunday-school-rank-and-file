import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Leaderboard from './Leaderboard';

export default function Results() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <div className='navbar-offset-container Results'>
        <a

          href='https://docs.google.com/spreadsheets/d/1sLEqJF3xtKneBczD37eaMvMexlHCC1INcOlQZeacJOQ/edit?usp=sharing'
          target='_blank'
          rel='noopener noreferrer'
        >
          Google Sheet with Picks and Results
        </a>
        <br /><br />
        <Leaderboard></Leaderboard>
      </div>
    </>
  );
};