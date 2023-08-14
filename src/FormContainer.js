import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API, Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import Team from './Team';
import RankPicks from './RankPicks';
import RankRanks from './RankRanks';
import FilePicks from './FilePicks';
import EndOfForm from './EndOfForm';
import './App.css';

Amplify.configure(awsExports);

const FormContainer = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isClosed, setIsClosed] = useState(false);
  const [closeTime, setCloseTime] = useState("")
  const [configId, setConfigId] = useState("");
  const [week, setWeek] = useState("Week");
  const [rankMatchups, setRankMatchups] = useState([]);
  const [fileMatchups, setFileMatchups] = useState([]);
  const [teams, setTeams] = useState(["Chose Team"]);

  const [team, setTeam] = useState("Chose Team");
  const [rankPicks, setRankPicks] = useState([]);
  const [filePicks, setFilePicks] = useState([]);
  const [rankedRanks, setRankedRanks] = useState([]);

  const [warning, setWarning] = useState("");
  const location = useLocation();
  let arr = location.pathname.split("/");

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

  useEffect( () => {
    const fetchPlayers = async () => {
      const response = await API.get('playerApi', '/player/get-players');
      const teamNames = response.map(team => team.teamName);
      const sortedTeams = [...teamNames].sort();
      setTeams(["Chose Team", ...sortedTeams]);
    }
    fetchPlayers();
  }, []);
  
  useEffect(() => {
    const fetchMatchups = async () => {
      try {
        const response = await API.get('sundaySchoolConfiguration', '/configuration/get-matchups');
        const { rankMatchups: fetchedRankMatchups, fileMatchups: fetchedFileMatchups, week: fetchedWeek, closeTime: fetchedCloseTime, Timestamp: fetchedTimestamp} = response;
        setRankMatchups(fetchedRankMatchups);
        setFileMatchups(fetchedFileMatchups);
        setWeek(fetchedWeek);
        setConfigId(fetchedTimestamp);
        setCloseTime(fetchedCloseTime);
        const isBeforeCurrentUTC = await isDateTimeBeforeCurrentUTC(fetchedCloseTime);
        if (isBeforeCurrentUTC) {
          setWarning(`The deadline has passed to submit picks for ${fetchedWeek}.`);
          setIsClosed(true);
        } else {
          setWarning("");
        }
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
      } catch (error) {
        console.error('Error fetching matchups:', error);
      }
    };
    fetchMatchups();
  }, []);

  const steps = [
    { id: 1, component: Team },
    { id: 2, component: RankPicks },
    { id: 3, component: RankRanks },
    { id: 4, component: FilePicks },
    { id: 5, component: EndOfForm },
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
  const handleRankChange = (ranks) => {
    setRankedRanks(ranks);
  };
  const handleTeamChange = (team) => {
    setTeam(team);
  };
  useEffect( () => {
    const checkTime = async () => {
      const isBeforeCurrentUTC = await isDateTimeBeforeCurrentUTC(closeTime);
      if (isBeforeCurrentUTC) {
        setWarning(`The deadline has passed to submit picks for ${week}.`);
        setIsClosed(true);
      } else {
        setWarning("");
      }
    }
    checkTime();
  }, [currentStep, closeTime, week]);
  const nextStep = () => {
    if(isClosed){
      return;
    }
    if (currentStep === 1) {
      if (team==="Chose Team") {
        setWarning("Please chose your team name");
        return;
      }
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
    setWarning("");
    setCurrentStep((prevStep) => prevStep - 1);
  };
  
  const sendToServer = async () => {
    try {
      let playerID = arr.slice(-1)[0];
      let fixedRanks = [...rankedRanks];
      fixedRanks.reverse();
      const response = await API.post('sundaySchoolSubmissions', `/submission/${playerID}`, {
        body: {
          team: team,
          week: week,
          configId: configId,
          rankPicks: JSON.stringify(rankPicks),
          rankedRanks: JSON.stringify(fixRankedRanks(fixedRanks)),
          filePicks: JSON.stringify(filePicks),
        }
      });
      console.log('Response', response);
    } catch (error) {
      console.error('Error submitting picks:', error);
    }
  }
  const fixRankedRanks = (array) =>{
    let newArray = [...array];
    for (let i = 0; i < newArray.length; i++) {
        newArray[array[i]-1] = i+1;
    }
    return newArray;
  }
  const handleSubmit = (event) => {
    event.preventDefault();
    if(isClosed){
      setWarning(`The deadline has passed to submit picks for ${week}.`);
      return;
    }
    
    if (currentStep === 4) {
      const hasIncompleteValues = filePicks.some(pick => pick.value === null);
      if (hasIncompleteValues) {
        setWarning("Please chose a winner for every game");
        return;
      }
    }
    setWarning("");
    nextStep();
    sendToServer();
  };

  return (
    <div className='FormContainer'>
      <h1>Sunday School {week}</h1>
      <form onSubmit={handleSubmit}>
        <CurrentStepComponent
          team={team}
          teams={teams}
          rankMatchups={rankMatchups}
          fileMatchups={fileMatchups}
          rankPicks={rankPicks}
          filePicks={filePicks}
          rankedRanks={rankedRanks}
          onRankPicksChange={handleRankPicksChange}
          onRankChange={handleRankChange}
          onFilePicksChange={handleFilePicksChange}
          onTeamChange={handleTeamChange}
        />
        <p className='warning'>{warning}</p>
        <div className='picks-form-nav'>
          {currentStep > 1 && currentStep < steps.length &&<button type="button" onClick={prevStep}>Previous</button>}
          {currentStep < steps.length-1 && <button type="button" onClick={nextStep}>Next</button>}
          {currentStep === steps.length-1 && <button type="submit">Submit</button>}
        </div>
      </form>
    </div>
  );
};

export default FormContainer;