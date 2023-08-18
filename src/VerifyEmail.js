import React from 'react';
import Navbar from './Navbar';
import './App.css';

export default function VerifyEmail() {
  return (
    <>
      <Navbar></Navbar>
      <div className='navbar-offset-container'>
        <h1>Verify Email</h1>
        <p>A verification link was sent to your email. You will not be able to sign in untill you verify your email</p>
      </div>
    </>
  );
}
