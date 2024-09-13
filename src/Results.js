import React from 'react';
import Navbar from './Navbar';
import './App.css';
import Leaderboard from './Leaderboard';

export default function Results() {
  return (
    <>
      <Navbar />
      <div className='navbar-offset-container Results'>
        <h1>View Picks and Results</h1>
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
}
