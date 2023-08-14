import React from 'react';
import Navbar from './Navbar';
import './App.css';

export default function Results() {
  return (
    <>
      <Navbar />
      <div className='navbar-offset-container Results'>
        <h1>View Picks and Results</h1>
        <a
          href='https://docs.google.com/spreadsheets/d/1cGmWVYAoAuAYCqPkbvU7BkO4FxA-AGoRoPQtRpviC4A/edit?usp=sharing'
          target='_blank'
          rel='noopener noreferrer'
        >
          Google Sheet with Picks and Results
        </a>
        <br /><br />
      </div>
    </>
  );
}
