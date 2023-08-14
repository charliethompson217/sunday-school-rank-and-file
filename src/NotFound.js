import React from 'react';
import Navbar from './Navbar';
import './App.css';
export default function NotFound() {
  return (
    <>
        <Navbar></Navbar>
        <div className='navbar-offset-container'>
            <h1>Page Not Found</h1>
            <p>Opps, this page does not exist! Please check your URL. If you are attempting to submit picks, please visit the unique link you received in your email.</p>
        </div>
    </>
  )
}
