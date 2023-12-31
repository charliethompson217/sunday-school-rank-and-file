
import React, { useEffect, useState } from 'react';
import { API, Amplify } from 'aws-amplify';
import SignIn from './SignIn';
import awsconfig from './aws-exports';
import Navbar from './Navbar';
import Countdown from './Countdown';
Amplify.configure(awsconfig);

export default function SubmissionAuthWrapper() {
    const [closeTime, setCloseTime] = useState('');
    const getTime = async () => {
        try {
            const curWeek = await API.get('sundaySchoolConfiguration', '/configuration/get-current-week');
            const {closeTime: fetchedCloseTime} = await API.put('sundaySchoolConfiguration', '/configuration/matchups',{
            body: {
                week: `${curWeek}`,
            },
            });
            setCloseTime(fetchedCloseTime);
        } catch (error) {
            console.error("error getting Countdown Time");
        }
    };
    useEffect(() => {
        getTime();
    }, []);
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
