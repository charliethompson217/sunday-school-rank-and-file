import React, { useState, useEffect } from 'react';
import { API, Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

Amplify.configure(awsExports);

const Leaderboard = () => {
  const [sortedPlayers, setSortedPlayers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [activeChart, setActiveChart] = useState('seasonleaderboard');
  const [week, setWeek] = useState('Choose week');
  const [gameResults, setGameResults] = useState([]);
  
  const weekOptions = [
    'Choose week', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 
    'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16', 'Week 17', 'Week 18'
  ];

  function decrementLastNumber(str) {
    return str.replace(/\d+$/, (num) => parseInt(num, 10) - 1);
  }

  useEffect(() => {

    const fetchPlayers = async () => {
      try {
        const response = await API.get('playerApi', '/player/get-players');
        setSortedPlayers(response);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };
    fetchPlayers();

    const fetchPicks = async () => {
      try {
        const fetchedCurWeek = await API.get('sundaySchoolConfiguration', '/configuration/get-current-week');
        const response = await API.get('sundaySchoolSubmissions', '/submission/get-submissions');
        setSubmissions(response);
        setWeek(decrementLastNumber(fetchedCurWeek));
      } catch (error) {
        console.error('Error fetching picks:', error);
      }
    };
    fetchPicks();

    const fetchGameResults = async () => {
      try {
        const fetchedGameResults = await API.get('sundaySchoolConfiguration', '/configuration/get-game-results');
        setGameResults(fetchedGameResults);
        console.log(JSON.stringify(fetchedGameResults));
      } catch (error) {
        console.error('Error fetching game results:', error);
      }
    }

    fetchGameResults();
  }, []);

  useEffect(() => {
    if (week !== 'Choose week') {
      const weekNumber = week.split(' ')[1]; 
      const weekIndex = parseInt(weekNumber, 10) - 1; 
      
      const weekSubmissions = submissions[weekIndex] || []; 
      
      const submissionsByPlayer = weekSubmissions.reduce((acc, submission) => {
        acc[submission.playerId] = submission;
        return acc;
      }, {});
      
      setFilteredSubmissions(submissionsByPlayer); 
    }
  }, [week, submissions]);

  const sortPlayers = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const playersToSort = [...sortedPlayers];
    playersToSort.sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === 'TotalDollarPayout' || key === 'FileWins' || key === 'RankPoints' || key === 'PlayoffsBucks') {
        aValue = parseFloat(aValue.replace(/[\$,]/g, ''));
        bValue = parseFloat(bValue.replace(/[\$,]/g, ''));
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setSortedPlayers(playersToSort);
  };

  const getSortIcon = (key) => (
    sortConfig.key === key ? (
      <FontAwesomeIcon icon={sortConfig.direction === 'ascending' ? faArrowUp : faArrowDown} />
    ) : null
  );

  function keepLastWord(inputString) {
    const words = inputString.split(' ');
    if (words.length > 0) {
      const lastWord = words[words.length - 1];
      return lastWord;
    }
    return inputString;
  }

  return (
    <div className='PlayerTable'>
      <div className='chart-tabs'>
        <button onClick={() => setActiveChart('seasonleaderboard')} className={activeChart === 'seasonleaderboard' ? 'active' : ''}> Season Leaderboard </button>
        <button onClick={() => setActiveChart('weeklyleaderboard')} className={activeChart === 'weeklyleaderboard' ? 'active' : ''}> Weekly Leaderboard </button>
        <button onClick={() => setActiveChart('weeklypicks')} className={activeChart === 'weeklypicks' ? 'active' : ''}> Weekly Picks </button>
      </div>
      
      {activeChart === 'seasonleaderboard' && (
        <table className='player-table'>
          <thead>
            <tr>
              <th onClick={() => sortPlayers('teamName')} className='table-header'>
                Team {getSortIcon('teamName')}
              </th>
              <th onClick={() => sortPlayers('RankPoints')} className='table-header'>
                Rank Points {getSortIcon('RankPoints')}
              </th>
              <th onClick={() => sortPlayers('FileWins')} className='table-header'>
                File Wins {getSortIcon('FileWins')}
              </th>
              <th onClick={() => sortPlayers('PlayoffsBucks')} className='table-header'>
                Playoffs Bucks {getSortIcon('PlayoffsBucks')}
              </th>
              <th onClick={() => sortPlayers('TotalDollarPayout')} className='table-header'>
                Total Dollar Payout {getSortIcon('TotalDollarPayout')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map(player => (
              <tr key={player.playerId}>
                <td>{player.teamName}</td>
                <td>{player.RankPoints}</td>
                <td>{player.FileWins}</td>
                <td>{player.PlayoffsBucks}</td>
                <td>{player.TotalDollarPayout}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {activeChart === 'weeklypicks' && (
  <div>
    <select className="week-select" value={week} onChange={(e) => setWeek(e.target.value)}>
      {weekOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    
    <div>
      <table>
        <thead>
          <tr>
            <th>Team</th>
            <th>Rank Picks</th>
            <th>File Picks</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, index) => {
            const submission = filteredSubmissions[player.playerId];

            const rankPicks = submission && typeof submission.rankPicks === 'string' 
              ? JSON.parse(submission.rankPicks) 
              : [];
            const filePicks = submission && typeof submission.filePicks === 'string' 
              ? JSON.parse(submission.filePicks) 
              : [];

            const currentWeekResults = gameResults[week] || {};
            const rankResults = currentWeekResults.rankResults || [];
            const fileResults = currentWeekResults.fileResults || [];

            const isPickCorrect = (pickValue, results) => {
              return results.some(result => keepLastWord(result.value) === pickValue);
            };

            return (
              <tr key={index}>
                <td>{player.teamName}</td>
                <td>
                  {Array.isArray(rankPicks) && rankPicks.length > 0 ? (
                    rankPicks.map((game, gameIndex) => {
                      const playerPick = keepLastWord(game.value);
                      const isCorrect = isPickCorrect(playerPick, rankResults);
                      return (
                        <span
                          key={gameIndex}
                          style={{
                            display: 'inline-block',
                            width: '100px',
                            textAlign: 'center',
                            backgroundColor: isCorrect ? 'green' : 'red'
                          }}
                        >
                          {playerPick}
                        </span>
                      );
                    })
                  ) : (
                    'No Picks'
                  )}
                </td>
                <td>
                  {Array.isArray(filePicks) && filePicks.length > 0 ? (
                    filePicks.map((game, gameIndex) => {
                      const playerPick = keepLastWord(game.value);
                      const isCorrect = isPickCorrect(playerPick, fileResults);
                      return (
                        <span
                          key={gameIndex}
                          style={{
                            display: 'inline-block',
                            width: '100px',
                            textAlign: 'center',
                            backgroundColor: isCorrect ? 'green' : 'red',
                          }}
                        >
                          {playerPick}
                        </span>
                      );
                    })
                  ) : (
                    'No Picks'
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
)}



    </div>
  );
};

export default Leaderboard;
