import React from 'react';
import SignIn from './SignIn';
import Admin from './Admin';
import jwtDecode from 'jwt-decode';
import Navbar from './Navbar';

export default function AdminAuthWrapper({ user, handleSignOut }) {
  if (user) {
    if (jwtDecode(user.signInUserSession.idToken.jwtToken)['cognito:groups'].includes('Admin')) {
      return (
        <>
          <Navbar></Navbar>
          <div className='navbar-offset-container'>
            <h1>Admin</h1>
            <Admin />
          </div>
        </>
      );
    } else {
      return (
        <>
          <Navbar></Navbar>
          <div className='navbar-offset-container'>
            waiting for aproval for admin access
          </div>
          <button onClick={handleSignOut}>Sign Out</button>
        </>
      );
    }
  }

  return (
    <>
      <Navbar></Navbar>
      <div className='navbar-offset-container'>
        <SignIn />
      </div>
    </>
  );
};