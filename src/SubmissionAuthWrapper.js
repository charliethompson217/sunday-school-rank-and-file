
import React, { useEffect, useState } from 'react';
import { Auth, Amplify } from 'aws-amplify';
import SignIn from './SignIn';
import awsconfig from './aws-exports';
import Navbar from './Navbar';
import FormContainer from './FormContainer';
Amplify.configure(awsconfig);

export default function SubmissionAuthWrapper() {
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

    if (user) {
        return (
        <>
            <Navbar></Navbar>
            <div className='navbar-offset-container'>
                <FormContainer/>
            </div>
        </>
        );
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
