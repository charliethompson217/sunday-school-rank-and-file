
import React, { useEffect, useState } from 'react';
import { API, Auth, Amplify } from 'aws-amplify';
import SignIn from './SignIn';
import awsconfig from './aws-exports';
import Navbar from './Navbar';
import Countdown from './Countdown';
Amplify.configure(awsconfig);

export default function SubmissionAuthWrapper() {
    const [user, setUser] = useState(null);
    const [closeTime, setCloseTime] = useState('');
    const checkAuthState = async () => {
        try {
            const {closeTime: fetchedCloseTime} = await API.get('sundaySchoolConfiguration', '/configuration/get-matchups');
            setCloseTime(fetchedCloseTime);
            const currentUser = await Auth.currentAuthenticatedUser();
            setUser(currentUser);
        } catch (error) {
            console.error('Error checking auth state:', error);
            setUser(null);
        }
    };
    const getTime = async () => {
        try {
            const {closeTime: fetchedCloseTime} = await API.get('sundaySchoolConfiguration', '/configuration/get-matchups');
            setCloseTime(fetchedCloseTime);
        } catch (error) {
            console.error('Error getting close time:',error);
        }
    };
    useEffect(() => {
        checkAuthState();
        getTime();
    }, []);

    if (user) {
        window.location.reload();
    }

    return (
    <>
        <Navbar></Navbar>
        <div className='navbar-offset-container'>
            <Countdown targetDate={closeTime}></Countdown>
            <SignIn/>
        </div>
    </>
    )
}
