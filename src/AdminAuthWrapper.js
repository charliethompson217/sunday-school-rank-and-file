import React, { useEffect, useState } from 'react';
import { Auth, Amplify } from 'aws-amplify';
import SignIn from './SignIn';
import Admin from './Admin';
import jwtDecode from 'jwt-decode';
import awsconfig from './aws-exports';
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
        } catch (err) {
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
        } catch (err) {
          console.error('error signing out: ', err);
        }
      };
    if (user) {
        if (user.isAdmin) {
          return (
            <>
              <h1>Admin</h1>
              <button onClick={handleSignOut}>Sign Out</button>
              <Admin />
            </>
          );
        } else {
          return (
            <>
              <div>
                waiting for aproval for admin access
              </div>
              <button onClick={handleSignOut}>Sign Out</button>
            </>
          );
        }
      }

    return (
    <div className=''>
        <SignIn/>
    </div>
    )
}
