import React, { useEffect } from 'react';
import Navbar from './Navbar';

export default function VerifyEmail() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar></Navbar>
      <div className='navbar-offset-container'>
        <h1>Verify Email</h1>
        <p>A verification link was sent to your email. You will not be able to sign in untill you verify your email.</p>
      </div>
    </>
  );
};