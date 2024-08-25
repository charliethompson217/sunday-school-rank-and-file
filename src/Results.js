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
        <br /><br />
        <Leaderboard></Leaderboard>
      </div>
    </>
  );
}
