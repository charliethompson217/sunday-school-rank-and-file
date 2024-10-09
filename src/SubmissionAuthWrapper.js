
import React, { useEffect, useState, useContext } from 'react';
import SignIn from './SignIn';
import Navbar from './Navbar';
import Countdown from './Countdown';
import { DataContext } from './DataContext';

export default function SubmissionAuthWrapper() {
    const { fetchedMatchupsResponse } = useContext(DataContext);
    const [closeTime, setCloseTime] = useState('');

    useEffect(() => {
        if (fetchedMatchupsResponse) {
            const { closeTime: fetchedCloseTime } = fetchedMatchupsResponse;
            setCloseTime(fetchedCloseTime);
        }
    }, [fetchedMatchupsResponse]);

    return (
        <>
            <Navbar></Navbar>
            <div className='navbar-offset-container'>
                <Countdown targetDate={closeTime}></Countdown>
                <SignIn />
            </div>
        </>
    );
};