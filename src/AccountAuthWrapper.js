import React, { useEffect, useState } from 'react';
import { Auth, Amplify } from 'aws-amplify';
import SignUp from './SignUp';
import SignIn from './SignIn';
import awsconfig from './aws-exports';
import Account from './Account';
import Navbar from './Navbar';
Amplify.configure(awsconfig);

export default function AccountAuthWrapper() {
    const [user, setUser] = useState(null);
    const checkAuthState = async () => {
        try {
            const currentUser = await Auth.currentAuthenticatedUser();
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
        return (
        <>
            <Account/>
            <button onClick={handleSignOut}>Sign Out</button>
        </>
        );
      }

    return (
    <>
        <Navbar></Navbar>
        <div className='navbar-offset-container'>
            <SignIn/>
            <SignUp/>
        </div>
    </>
    )
}
