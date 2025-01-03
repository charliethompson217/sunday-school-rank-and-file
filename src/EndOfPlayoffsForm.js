import Navbar from './Navbar';
import React, { useContext, useState, useEffect } from 'react';
import { DataContext } from './DataContext';

export default function EndOfPlayoffsForm() {
    const [parlay, setParlay] = useState(false);
    const { fetchedMatchupsResponse, fetchedPlayoffsPicks } = useContext(DataContext);

    useEffect(() => {
        if (Array.isArray(fetchedPlayoffsPicks) && fetchedPlayoffsPicks.some(p => p.parlay === 'true')) {
            setParlay(true);
        }
    }, [fetchedPlayoffsPicks]);

    return (
        <>
            <Navbar></Navbar>
            <div className='navbar-offset-container'>
                <div className='end-of-form'>
                    <h1>End of Form</h1>
                    <p>Thank you for making your picks. They are below. Feel free to fill out the form as many times as you'd like. Only your most recent Picks will be tabulated.</p>
                    <br></br>
                    <h2>Spread Bets</h2>
                    {Array.isArray(fetchedPlayoffsPicks) && fetchedPlayoffsPicks.map((pick, idx) => {
                        if (Array.isArray(fetchedMatchupsResponse.matchups) && fetchedMatchupsResponse.matchups[idx]) {
                            return (
                                <div key={idx} >
                                    {pick.bet === 'true' && (<>
                                        <h3> {fetchedMatchupsResponse.matchups[idx].Away} @ {fetchedMatchupsResponse.matchups[idx].Home}</h3>
                                        <p>{pick.winner} Wager: {pick.wager}</p>
                                    </>)}
                                </div>
                            );
                        }
                        return null;
                    })}
                    <br></br>
                    {parlay && (
                        <>
                            <h2>Parlay Bets</h2>
                            {Array.isArray(fetchedPlayoffsPicks) && fetchedPlayoffsPicks.map((pick, idx) => {
                                if (Array.isArray(fetchedMatchupsResponse.matchups) && fetchedMatchupsResponse.matchups[idx]) {
                                    return (
                                        <div key={idx} >
                                            {pick.parlay === 'true' && (<p>
                                                <h3>{fetchedMatchupsResponse.matchups[idx].Away} @ {fetchedMatchupsResponse.matchups[idx].Home}</h3>
                                                {pick.parlayWinner}
                                            </p>)}
                                        </div>
                                    );
                                }
                                return null;
                            })}
                            <p>Parlay Wager: {fetchedPlayoffsPicks[0].parlayWager}</p>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}
