import React from 'react';
import Navbar from './Navbar';
import './App.css';

export default function Account(user) {
    console.log(user);
  return (
    <>
      <Navbar></Navbar>
      <div className='navbar-offset-container'>
        <h1>Account</h1>
        <p>User attribute edits coming soon</p>
      </div>
    </>
  )
}
