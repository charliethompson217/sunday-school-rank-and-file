import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, Amplify, Auth } from 'aws-amplify';
import awsExports from './aws-exports';
import Countdown from './Countdown';
import Navbar from './Navbar';
import Playoffs from './Playoffs';
import { DataContext } from './DataContext';

Amplify.configure(awsExports);

export default function PlayoffsFormContainer({ user }) {
  const { fetchedMatchupsResponse, fetchedCurPicks, fetchedPlayoffsPicks, setNewPlayoffsPicks} = useContext(DataContext);
  const { week, closeTime: fetchedCloseTime, Timestamp: fetchedConfigId } = fetchedMatchupsResponse;
  const navigate = useNavigate();
  const [isClosed, setIsClosed] = useState(true);
  const [configId, setConfigId] = useState("");
  const [warning, setWarning] = useState("");
  const [picks, setPicks] = useState([]);
  const [closeTime, setCloseTime] = useState("");
  const [closeUpdated, setCloseUpdated] = useState(false);
  const { fetchedPlayers } = useContext(DataContext);
  const [playoffsBucks, setPlayoffsBucks] = useState('');
  const [remainingPlayoffsBucks, setRemainingPlayoffsBucks] = useState(0);
  const [canSubmit, setCanSubmit] = useState(false);
  const [parlayBet, setParlayBet] = useState(false);



  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const setUserData = async () => {
      try {
        let curPlayer;
        for (var player of fetchedPlayers) {
          if (player.playerId === user.attributes['custom:playerId']) {
            curPlayer = player;
            setPlayoffsBucks(curPlayer.PlayoffsBucks);
            setRemainingPlayoffsBucks(curPlayer.PlayoffsBucks);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    if (fetchedPlayers) setUserData();
  }, [fetchedPlayers, user]);

  async function isDateTimeBeforeCurrentUTC(inputDateTimeString) {
    try {
      const response = await fetch('https://worldtimeapi.org/api/ip');
      const data = await response.json();
      const currentUTCTime = new Date(data.utc_datetime).getTime();
      const inputDate = new Date(inputDateTimeString).getTime();
      return inputDate < currentUTCTime;
    } catch (error) {
      console.error('Error fetching UTC time:', error);
      return false;
    }
  }
  
  const checkTime = useCallback(async () => {
    try {
    if(!closeTime) return;
      const isAfterClose = await isDateTimeBeforeCurrentUTC(closeTime);
      if (!closeUpdated && !isAfterClose && !isClosed) {
        const extendedTime = new Date(closeTime).getTime() + 600000;
        setCloseTime(new Date(extendedTime).toISOString());
        setCloseUpdated(true);
      }
      const newIsClosed = await isDateTimeBeforeCurrentUTC(closeTime);
      setIsClosed(newIsClosed);
    } catch (error) {
      console.error('Error checking time:', error);
    }
  }, [closeTime, closeUpdated, isClosed]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setCloseTime(fetchedCloseTime);
    setConfigId(fetchedConfigId);
    checkTime();
  }, [fetchedCloseTime, fetchedConfigId, checkTime]);

  useEffect(() => {
    if (fetchedPlayoffsPicks?.length>0) {
        if(fetchedConfigId === fetchedCurPicks.configId)
            setPicks(fetchedPlayoffsPicks);
    }
  }, [fetchedCurPicks, fetchedPlayoffsPicks, fetchedConfigId]);

  const handlePickChange = (index, field, value) => {
    const updated = [...picks];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setPicks(updated);
  };

  useEffect(() => {
    setWarning('');
    setCanSubmit(true);
    let total = 0;
    let parlay = false;
    for (let i = 0; i < picks.length; i++) {
      if (picks[i].bet === 'true') {
        let wager = parseInt(picks[i].wager);
        if (isNaN(wager)) {
          wager = 0;
        }
        if(wager>0)
            total += wager;
        else if (wager <= 0) {
          setCanSubmit(false);
          setWarning('You must wager at least 1 Playoffs Buck for each wagered game.');
        }
        if (picks[i].winner === '' || picks[i].winner === undefined) {
          setCanSubmit(false);
          setWarning('You must select a winner for each wagered game.');
        }
      }
    }
    
    let count = 0;
    for (let i = 0; i < picks.length; i++) {
      if (picks[i].parlay === 'true') {
        parlay = true;
        count += 1;
        if (picks[i].parlayWinner === '' || picks[i].parlayWinner === undefined) {
            setCanSubmit(false);
            setWarning('You must select a winner for each wagered game.');
          }
      }
    }
    if (count !== 4 && count !== 0) {
      setCanSubmit(false);
      setWarning('You must select exactly 0 or 4 games for a parlay.');
    }
    let parlayWager = 0;
    if (picks[0]?.parlayWager !== undefined) {
        parlayWager = parseInt(picks[0].parlayWager);
        if (isNaN(parlayWager)) {
          parlayWager = 0;
        }
        if(parlay)
            total += parlayWager;
    }
    if(parlay && parlayWager <= 0) {
        setCanSubmit(false);
        setWarning('You must wager at least 1 Playoffs Buck for a parlay.');
    }
    let Remaining = parseInt(playoffsBucks) - total;
    setRemainingPlayoffsBucks(Remaining);
    if (Remaining < 0) {
        setCanSubmit(false);
        setWarning('You do not have enough Playoffs Bucks to make this wager.');
    }
    setParlayBet(parlay);
  }, [picks, playoffsBucks]);

  const sanitizePicks = (picks) => {
    return picks.map(pick => {
      const sanitizedPick = { ...pick };
      if (sanitizedPick.bet !== 'true') {
        sanitizedPick.winner = '';
        sanitizedPick.wager = 0;
      }
      if (sanitizedPick.parlay !== 'true') {
        sanitizedPick.parlayWinner = '';
        sanitizedPick.parlayWager = 0;
      }
      return sanitizedPick;
    });
  };

  const sendToServer = async () => {
    try {
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      const sanitizedPicks = sanitizePicks(picks);
      await API.post('authorizedPlayerAPI', '/player/submit-playoffs-picks', {
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
        body: {
          operation: 'submit-playoffs-picks',
          configId: configId,
          picks: JSON.stringify(sanitizedPicks),
        }
      });
    } catch (error) {
      console.error('Error submitting picks:', error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isClosed) {
      setWarning(`The deadline has passed to submit picks for ${week}.`);
      return;
    } else if (!canSubmit) {
        return;
    }
    else {
      setWarning('');
    }
    setWarning("");
    setNewPlayoffsPicks(picks, configId);
    navigate('/endofplayoffsform');
    sendToServer();
  };

  return (
    <>
      <Navbar></Navbar>
      <div className='navbar-offset-container'>
        <div className='FormContainer'>
          <h1>{week}</h1>
          <Countdown targetDate={closeTime}></Countdown>
          <Playoffs handleSubmit={handleSubmit} fetchedMatchupsResponse={fetchedMatchupsResponse} picks={picks} handlePickChange={handlePickChange} warning={warning} playoffsBucks={playoffsBucks} remainingPlayoffsBucks={remainingPlayoffsBucks} parlayBet={parlayBet}></Playoffs>
        </div>
      </div>
    </>
  );
}