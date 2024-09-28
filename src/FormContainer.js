import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, Amplify, Auth } from 'aws-amplify';
import awsExports from './aws-exports';
import Loading from './Loading';
import RankPicks from './RankPicks';
import RankRanks from './RankedRanks';
import FilePicks from './FilePicks';
import './App.css';
import Countdown from './Countdown';
import Navbar from './Navbar';
import { DataContext } from './DataContext';

Amplify.configure(awsExports);

const FormContainer = ( {User}) => {
  const {fetchedMatchupsResponse, fetchedCurPicks, setNewPicks, fetchedRankPicks, fetchedRankedRanks, fetchedFilePicks  } = useContext(DataContext);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isClosed, setIsClosed] = useState(true);
  const [closeTime, setCloseTime] = useState("");
  const [closeUpdated, setCloseUpdated] = useState(false);
  const [configId, setConfigId] = useState("");
  const [week, setWeek] = useState("Week");
  const [rankMatchups, setRankMatchups] = useState();
  const [fileMatchups, setFileMatchups] = useState();
  const [rankPicks, setRankPicks] = useState();
  const [filePicks, setFilePicks] = useState();
  const [rankedRanks, setRankedRanks] = useState();
  const [newrankedRanks, setNewRankedRanks] = useState([]);
  const [warning, setWarning] = useState("");

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
  useEffect(() => {
    const fetchMatchups = async () => {
      try {
        
        const { rankMatchups: fetchedRankMatchups, fileMatchups: fetchedFileMatchups, week: fetchedWeek, closeTime: fetchedCloseTime, Timestamp: fetchedConfigId} = fetchedMatchupsResponse;
        setRankMatchups(fetchedRankMatchups);
        setFileMatchups(fetchedFileMatchups);
        setWeek(fetchedWeek);
        setConfigId(fetchedConfigId);
        setCloseTime(fetchedCloseTime);
        const isBeforeCurrentUTC = await isDateTimeBeforeCurrentUTC(fetchedCloseTime);
        setIsClosed(isBeforeCurrentUTC);
        if (isBeforeCurrentUTC) {
          setWarning(`The deadline has passed to submit picks for ${fetchedWeek}.`);
        }
        else {
          setWarning('');
        }
        try {
          if ((fetchedCurPicks!=null)&&(fetchedConfigId===fetchedCurPicks.configId)) {
            setRankPicks([...fetchedRankPicks]);
            setRankedRanks([...fetchedRankedRanks]);
            setNewRankedRanks([...fetchedRankedRanks]);
            setFilePicks([...fetchedFilePicks]);
          } else if(fetchedRankMatchups && fetchedFileMatchups && fetchedRankMatchups) {
            const initialRankPicks = fetchedRankMatchups.map((matchup) => ({
              game: matchup,
              value: null,
            }));
            setRankPicks(initialRankPicks);
    
            const initialFilePicks = fetchedFileMatchups.map((matchup) => ({
              game: matchup,
              value: null,
            }));
            setFilePicks(initialFilePicks);
    
            const initialRankRanks = fetchedRankMatchups.map((item, index) => index + 1);
            setRankedRanks(initialRankRanks);
            setNewRankedRanks(initialRankRanks);
          }
          if(!isBeforeCurrentUTC){
            setCurrentStep(2);
          }
        } catch (error) {
          console.error('Error fetching players:', error);
        }
      } catch (error) {
        console.error('Error fetching matchups:', error);
      }
    };
    fetchMatchups();
  }, [User, fetchedCurPicks, fetchedRankPicks, fetchedRankedRanks, fetchedFilePicks, fetchedMatchupsResponse]);

  const steps = [
    { id: 1, component: Loading },
    { id: 2, component: RankPicks },
    { id: 3, component: RankRanks },
    { id: 4, component: FilePicks },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;

  const handleRankPicksChange = (index, value) => {
    setRankPicks((prevRankPicks) =>
      prevRankPicks.map((pick, i) =>
        i === index ? { ...pick, value } : pick
      )
    );
  };
  const handleFilePicksChange = (index, value) => {
    setFilePicks((prevFilePicks) =>
      prevFilePicks.map((pick, i) =>
        i === index ? { ...pick, value } : pick
      )
    );
  };
  const handleRankChange = useCallback((ranks) => {
    setNewRankedRanks(ranks);
  }, []);


  const checkTime = async () => {
    try {
      const isAfterClose = await isDateTimeBeforeCurrentUTC(closeTime);
      if(!closeUpdated&&isAfterClose&&!isClosed){
        const newCloseTime = new Date(closeTime).getTime()+600000;
        setCloseTime(newCloseTime);
        setCloseUpdated(true);
      }
      const newIsClosed = await isDateTimeBeforeCurrentUTC(closeTime);
      setIsClosed(newIsClosed);
    } catch(error) {
      console.error('Error checking time:', error);
    }
    
  };
  
  const nextStep = () => {
    setRankedRanks(newrankedRanks);
    checkTime();
    if(isClosed){
      setWarning(`The deadline has passed to submit picks for ${week}.`);
      return;
    }
    else {
      setWarning('');
    }
    if (currentStep === 2) {
      const hasIncompleteValues = rankPicks.some(pick => pick.value === null);
      if (hasIncompleteValues) {
        setWarning("Please chose a winner for every game");
        return;
      }
    }
    setWarning("");
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const prevStep = () => {
    setRankedRanks(newrankedRanks);
    setWarning("");
    setCurrentStep((prevStep) => prevStep - 1);
  };
  
  const sendToServer = async () => {
    try {
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      await API.post('sundaySchoolAuthorized', '/player/submit-picks', {
        headers: {
          Authorization: `Bearer ${idToken}`
        },
        body: {
          operation: 'submit-picks',
          configId: configId,
          rankPicks: JSON.stringify(rankPicks),
          rankedRanks: JSON.stringify(rankedRanks),
          filePicks: JSON.stringify(filePicks),
        }
      });
    } catch (error) {
      console.error('Error submitting picks:', error);
    }
  }
  
  const handleSubmit = (event) => {
    event.preventDefault();
    if(isClosed){
      setWarning(`The deadline has passed to submit picks for ${week}.`);
      return;
    }
    else {
      setWarning('');
    }
    
    if (currentStep === 4) {
      const hasIncompleteValues = filePicks.some(pick => pick.value === null);
      if (hasIncompleteValues) {
        setWarning("Please chose a winner for every game");
        return;
      }
    }
    setWarning("");
    setNewPicks(rankPicks, rankedRanks, filePicks, configId);
    navigate('/endofform');
    sendToServer();
  };

  if(!fetchedMatchupsResponse || !rankPicks || !filePicks || !rankedRanks ){
    <>
      <Navbar></Navbar>
      <div className='navbar-offset-container'>
        <div className='FormContainer'>
          <h1>Sunday School {week}</h1>
        </div>
      </div>
    </>
  }

  return (
    <>
      <Navbar></Navbar>
      <div className='navbar-offset-container'>
        <div className='FormContainer'>
          <h1>Sunday School {week}</h1>
          <Countdown targetDate={closeTime}></Countdown>
          <form onSubmit={handleSubmit}>
            <CurrentStepComponent
              rankMatchups={rankMatchups}
              fileMatchups={fileMatchups}
              rankPicks={rankPicks}
              filePicks={filePicks}
              rankedRanks={rankedRanks}
              onRankPicksChange={handleRankPicksChange}
              onRankChange={handleRankChange}
              onFilePicksChange={handleFilePicksChange}
            />
            <p className='warning'>{warning}</p>
            <div className='picks-form-nav'>
              {currentStep > 2 &&<button type="button" onClick={prevStep}>Previous</button>}
              {currentStep < steps.length && <button type="button" onClick={nextStep}>Next</button>}
              {currentStep === steps.length && <button type="submit">Submit</button>}
            </div>
          </form>
        </div>
      </div>
    </>
    
  );
};

export default FormContainer;