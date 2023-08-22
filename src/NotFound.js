import React from 'react';
import Navbar from './Navbar';
import './App.css';
export default function NotFound() {
  return (
    <>
        <Navbar></Navbar>
        <div className='navbar-offset-container'>
            <h1>Page Not Found</h1>
            <p>Ops, this page does not exist! Please check your URL.</p>
        </div>
    </>
  )
}
