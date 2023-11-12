import React, { useState, useEffect } from 'react';
import { API, Amplify, Auth } from 'aws-amplify';
import awsExports from './aws-exports';
import './App.css';

Amplify.configure(awsExports);

export default function PullPicks() {
  const [currentConfigId, setCurrentConfigId] = useState("");
  const [players, setPlayers] = useState([]);
  const [playerPicks, setPlayerPicks] = useState([]);
  const [unsubmittedPlayers, setUnsubmittedPlayers] = useState([]);

  const compareByTeamName = (a, b) => {
    if (a.teamName < b.teamName) return -1;
    if (a.teamName > b.teamName) return 1;
    return 0;
  };
  useEffect( () => {
    const fetchConfigId = async () => {
      setCurrentConfigId([]);
      try {
        const curWeek = await API.get('sundaySchoolConfiguration', '/configuration/get-current-week');
        console.log(curWeek);
        const response = await API.put('sundaySchoolConfiguration', '/configuration/matchups',{
          body: {
            week: `${curWeek}`,
          },
        });
        const {Timestamp: fetchedTimestamp} = response;
        setCurrentConfigId(fetchedTimestamp);
      } catch (error) {
        console.error('Error fetching configId:', error);
      }
    };
    const fetchPlayers = async () => {
      setPlayers([]);
      try {
        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();
        const response = await API.get('ssAdmin', '/admin/get-players',{
          headers: {
            Authorization: `Bearer ${idToken}`
          },
        });
        const sortedPlayers = [...response].sort(compareByTeamName);
        setPlayers(sortedPlayers);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    }
    fetchConfigId();
    fetchPlayers();
  }, []);
  useEffect( () => {
    setPlayerPicks([]);
    const fetchPicksForPlayers = async (playersToFetchPicksFor) => {
      try {
        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();
        const response = await API.put('ssAdmin', `/admin/pull-picks`,{
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          body: {
            players: playersToFetchPicksFor
          }
        });
        setPlayerPicks(response);
      } catch (error) {
        console.error( 'Error fetching picks for players', error);
      }
    }
    let playersToFetchPicksFor = [];
    players.forEach((player) => {
      playersToFetchPicksFor.push(player.teamName);
    });
    fetchPicksForPlayers(playersToFetchPicksFor);
  }, [players]);

  useEffect(() =>{
    setUnsubmittedPlayers([]);
    playerPicks.forEach((picks) => {
      if(picks.configId!==currentConfigId){
        setUnsubmittedPlayers((prevUnsubmittedPlayers) => [...prevUnsubmittedPlayers, picks.team])
      }
    });
  }, [playerPicks, currentConfigId]);

  function keepLastWord(inputString) {
    const words = inputString.split(' ');
    if (words.length > 0) {
      const lastWord = words[words.length - 1];
      return lastWord;
    }
    return inputString;
  }
  const fixRankedRanks = (array) =>{
    array.reverse();
    let newArray = [...array];
    for (let i = 0; i < newArray.length; i++) {
        newArray[array[i]-1] = i+1;
    }
    return newArray;
  }
  const parseJsonString = (jsonString) => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return null;
    }
  };
  
  const generateCsvData = (playerPicks) => {
    let csvData = '';
    csvData += '\n';
    csvData += 'Full Name,Team-Name,';
    for (let i = 1; i <= 16; i++) {
      csvData += `Game ${i},`;
    }
    for (let i = 1; i <= 16; i++) {
      csvData += `Their Ranking of game ${i},`;
    }
    for (let i = 1; i <= 4; i++) {
      csvData += `File Pick ${i},`;
    }
    csvData += '\n';
  
    playerPicks.forEach((picks) => {
      if (picks.configId === currentConfigId) {
        const team = picks.team || '';
        const fullName = picks.fullName || '';
        csvData += `${fullName},`;
        csvData += `${team},`;

        const rankedPicks = parseJsonString(picks.rankPicks) || [];
        for (let i = 0; i < 16; i++) {
          const value = rankedPicks[i]?.value || '';
          csvData += keepLastWord(`${value},`);
        }
  
        const fetchedRankedRanks = parseJsonString(picks.rankedRanks) || [];
        const rankedRanks = fixRankedRanks(fetchedRankedRanks);
        for (let i = 0; i < 16; i++) {
          const rank = rankedRanks[i] || '';
          csvData += `${rank},`;
        }
  
        const filePicks = parseJsonString(picks.filePicks) || [];
        for (let i = 0; i < 4; i++) {
          const value = filePicks[i]?.value || '';
          csvData += keepLastWord(`${value},`);
        }
  
        csvData += '\n';
      }
    });
  
    return csvData;
  };
  
  const downloadCsv = () => {
    const csvData = generateCsvData(playerPicks);
    if (csvData) {
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'picks.csv';
      link.click();
    }
  };

  const downloadPicks = () => {
    downloadCsv();
  }


  return (
    <div>
        <h2>Download Picks</h2>
        <p>
        (download before updating form)
        </p>
        <div>
        <button onClick={() => downloadPicks()}>Download CSV</button>
        </div>
        <div>
          <h4>The following {unsubmittedPlayers.length} players have not submitted their picks:</h4>
          <ul>
            {unsubmittedPlayers.map(player => (
              <li key={player}>
                {player}
              </li>
            ))}
          </ul>
        </div>
    </div>
  )
}
