import React, { useEffect, useState } from 'react';
import { Auth, Amplify } from 'aws-amplify';
import SignIn from './SignIn';
import Admin from './Admin';
import jwtDecode from 'jwt-decode';
import awsconfig from './aws-exports';
import Navbar from './Navbar';
Amplify.configure(awsconfig);

export default function AdminAuthWrapper() {
    const [user, setUser] = useState(null);
    const checkAuthState = async () => {
        try {
            const currentUser = await Auth.currentAuthenticatedUser();
            const idToken = currentUser.signInUserSession.idToken.jwtToken;
            const decodedToken = jwtDecode(idToken);
        
            if (decodedToken['cognito:groups'] && decodedToken['cognito:groups'].includes('Admin')) {
                currentUser.isAdmin = true; 
            } else {
                currentUser.isAdmin = false; 
            }
        
            setUser(currentUser);
        } catch (error) {
            console.error('Error fetching user:', error);
            setUser(null);
        }
    };
    useEffect(() => {
        checkAuthState();
    }, []);
    const handleSignOut = async () => {
        try {
          await Auth.signOut();
          setUser(null);
        } catch (error) {
          console.error('error signing out: ', error);
        }
      };
    if (user) {
        if (user.isAdmin) {
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
            <SignIn/>
        </div>
      </>
    )
}
