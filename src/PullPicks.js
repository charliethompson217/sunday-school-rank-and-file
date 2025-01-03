import React, { useState, useEffect, useContext } from 'react';
import { API, Amplify, Auth } from 'aws-amplify';
import awsExports from './aws-exports';
import { DataContext } from './DataContext';

Amplify.configure(awsExports);

export default function PullPicks() {
  const [players, setPlayers] = useState([]);
  const [playerPicks, setPlayerPicks] = useState([]);
  const [unsubmittedPlayers, setUnsubmittedPlayers] = useState([]);
  const [week, setWeek] = useState('Choose week');
  const { fetchedCurWeek, fetchedAdminPlayers } = useContext(DataContext);
  const [curWeek, setCurWeek] = useState(fetchedCurWeek);

    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
      setCurWeek(fetchedCurWeek);
    }, [fetchedCurWeek]);

    const weekNumber = curWeek ? parseInt(curWeek.split(' ')[1]) : NaN;

  const weekOptions = [
    'Choose week', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16', 'Week 17', 'Week 18', 'Wild Card Round', 'Divisional Round', 'Conference Round', 'Super Bowl'
  ];

  const compareByFullName = (a, b) => {
    if (a.fullName < b.fullName) return -1;
    if (a.fullName > b.fullName) return 1;
    return 0;
  };

  useEffect(() => {
    if (fetchedAdminPlayers && fetchedCurWeek) {
      const sortedPlayers = [...fetchedAdminPlayers].sort(compareByFullName)
        .filter(player => player.RankPoints !== null && player.RankPoints !== undefined);
      setPlayers(sortedPlayers);
      setWeek(fetchedCurWeek);
    }
  }, [fetchedCurWeek, fetchedAdminPlayers]);

  useEffect(() => {
    const fetchPicksForPlayers = async (playersToFetchPicksFor) => {
      try {
        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();
        const response = await API.put('ssAdmin', `/admin/pull-picks`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          body: {
            players: playersToFetchPicksFor,
            week: week,
          }
        });
        setPlayerPicks(response);
      } catch (error) {
        console.error('Error fetching picks for players', error);
      }
    }
    let playersToFetchPicksFor = [];
    if (players.length > 0 && week !== "Choose Week") {
      players.forEach((player) => {
        playersToFetchPicksFor.push(player.teamName);
      });
      fetchPicksForPlayers(playersToFetchPicksFor);
    }
  }, [players, week]);

  useEffect(() => {
    if (!players || !playerPicks || !week) return;

    const filteredPlayers = players.filter(player =>
      !playerPicks.some(picks => picks.week === week && picks.team === player.teamName)
    );

    setUnsubmittedPlayers(filteredPlayers);
  }, [players, playerPicks, week]);

  function keepLastWord(inputString) {
    if (typeof inputString !== 'string' || inputString.trim() === '') {
      return '';
    }
    const words = inputString.split(' ');
    return words[words.length - 1];
  };

  const fixRankedRanks = (array) => {
    array.reverse();
    let newArray = [...array];
    for (let i = 0; i < newArray.length; i++) {
      newArray[array[i] - 1] = i + 1;
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

  const generateRegularSeasonCsvData = (playerPicks) => {
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
      if (picks.week === week) {
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

  const generatePlayoffsCsvData = (playerPicks) => {
    let csvData = 'Full Name,Team,Player ID,Game #,Bet,Winner,Wager,Parlay,Parlay Winner,Parlay Wager\n';
    playerPicks.forEach((pick) => {
      if (pick.week === week) {
        const picksArray = parseJsonString(pick.picks) || [];
        picksArray.forEach((gamePick, idx) => {
          const bet = gamePick.bet === 'true';
          const parlay = gamePick.parlay === 'true';
          csvData += `${pick.fullName},${pick.team},${pick.playerId},${idx + 1},${bet},${bet ? gamePick.winner : ''},${bet ? gamePick.wager : 0},${parlay},${parlay ? gamePick.parlayWinner : ''},`;
          if (parlay && idx === 0) {
            csvData += gamePick.parlayWager || '';
          } else if (!parlay && idx === 0) {
            csvData += 0;
          }
          csvData += '\n';
        });
      }
    });
    return csvData;
  };

  const downloadCsv = () => {
    let csvData;
    if (!isNaN(weekNumber)) {
      csvData = generateRegularSeasonCsvData(playerPicks);
    } else {
      csvData = generatePlayoffsCsvData(playerPicks);
    }
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
  };


  return (
    <div>
      <h2>Pull Picks</h2>
      <div>
        <label htmlFor="pullpicks-weekSelect">For Week:</label>
        <select id="pullpicks-weekSelect" value={week} onChange={(e) => setWeek(e.target.value)}>
          {weekOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div>
        <button onClick={() => downloadPicks()}>Download CSV</button>
      </div>
      <div>
        <h4>The following {unsubmittedPlayers.length} players have not submited their picks:</h4>
        <ul>
          {unsubmittedPlayers.map(player => (
            <li key={player.playerId}>
              {player.fullName}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
