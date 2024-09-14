import React, { useState, useEffect, useContext } from 'react';
import {Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { DataContext } from './DataContext';

Amplify.configure(awsExports);

const Leaderboard = () => {
  const { fetchedCurWeek, fetchedPlayers, fetchedSubmissions, fetchedGameResults} = useContext(DataContext);
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
    setSortedPlayers(fetchedPlayers);
    setSubmissions(fetchedSubmissions);
    setWeek(decrementLastNumber(fetchedCurWeek));
    setGameResults(fetchedGameResults);
  }, [fetchedPlayers, fetchedSubmissions, fetchedCurWeek, fetchedGameResults]);

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
        aValue = parseFloat(aValue.replace(/[$,]/g, ''));
        bValue = parseFloat(bValue.replace(/[$,]/g, ''));
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

  const calculateMaxColumnWidths = (players) => {
    if (!Array.isArray(players) || players.length === 0) {
      return { maxRankWidths: [], maxFileWidths: [] };
    }
    const maxRankWidths = [];
    const maxFileWidths = [];

    players.forEach((player) => {
      const submission = filteredSubmissions[player.playerId];
      const rankPicks = submission && typeof submission.rankPicks === 'string' ? JSON.parse(submission.rankPicks) : [];
      const filePicks = submission && typeof submission.filePicks === 'string' ? JSON.parse(submission.filePicks) : [];
      const rankRanks = submission && typeof submission.rankedRanks === 'string' ? JSON.parse(submission.rankedRanks) : [];

      rankPicks.forEach((rank, index) => {
        const combinedLength = (rankRanks[index]?.length || 0) + (keepLastWord(rank.value).length || 0);
        if (!maxRankWidths[index] || combinedLength > maxRankWidths[index]) {
          maxRankWidths[index] = combinedLength;
        }
      });

      filePicks.forEach((file, index) => {
        const combinedLength = keepLastWord(file.value).length;
        if (!maxFileWidths[index] || combinedLength > maxFileWidths[index]) {
          maxFileWidths[index] = combinedLength;
        }
      });
    });

    return { maxRankWidths, maxFileWidths };
  };

  const { maxRankWidths, maxFileWidths } = calculateMaxColumnWidths(sortedPlayers);

  const getWidth = (length) => `${length * 10 + 15}px`;


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
          {sortedPlayers && sortedPlayers.length > 0 ? (
            sortedPlayers.map(player => (
              <tr key={player.playerId}>
                <td>{player.teamName}</td>
                <td>{player.RankPoints}</td>
                <td>{player.FileWins}</td>
                <td>{player.PlayoffsBucks}</td>
                <td>{player.TotalDollarPayout}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No players available</td>
            </tr>
          )}
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
            <table className="weekly-picks">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Rank Picks</th>
                  <th>File Picks</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers && sortedPlayers.length > 0 ? (
                  sortedPlayers.map((player, index) => {
                    const submission = filteredSubmissions[player.playerId];
                    const rankPicks = submission && typeof submission.rankPicks === 'string' 
                      ? JSON.parse(submission.rankPicks) 
                      : [];
                    const filePicks = submission && typeof submission.filePicks === 'string' 
                      ? JSON.parse(submission.filePicks) 
                      : [];
                    const rankRanks = submission && typeof submission.rankedRanks === 'string' 
                      ? JSON.parse(submission.rankedRanks) 
                      : [];

                    const currentWeekResults = gameResults[week] || {};
                    const rankResults = currentWeekResults.rankResults || [];
                    const fileResults = currentWeekResults.fileResults || [];

                    const isPickCorrect = (pickValue, results) => {
                      return results.some(result => keepLastWord(result.value) === pickValue);
                    };

                    return (
                      <tr key={index}>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>{player.teamName}</td>
                        <td>
                          {Array.isArray(rankPicks) && rankPicks.length > 0 ? (
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: rankPicks.map((_, gameIndex) => getWidth(maxRankWidths[gameIndex])).join(' '), // Dynamically set column widths
                              gap: '0px'
                            }}>
                              {rankPicks.map((game, gameIndex) => {
                                const playerPick = keepLastWord(game.value);
                                const isCorrect = isPickCorrect(playerPick, rankResults);
                                return (
                                  <div
                                    key={gameIndex}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      width: getWidth(maxRankWidths[gameIndex]), // Use calculated width
                                      height: '40px',
                                      backgroundColor: isCorrect ? 'rgb(0, 120, 0)' : 'rgb(200, 0, 0)',
                                      color: 'black',
                                      fontSize: '12px',
                                      fontWeight: 'bold',
                                      border: '1px solid black',
                                    }}
                                  >
                                    {rankRanks[gameIndex]}~{playerPick}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            'No Picks'
                          )}
                        </td>
                        <td>
                          {Array.isArray(filePicks) && filePicks.length > 0 ? (
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: filePicks.map((_, gameIndex) => getWidth(maxFileWidths[gameIndex])).join(' '), // Dynamically set column widths
                              gap: '0px'
                            }}>
                              {filePicks.map((game, gameIndex) => {
                                const playerPick = keepLastWord(game.value);
                                const isCorrect = isPickCorrect(playerPick, fileResults);
                                return (
                                  <div
                                    key={gameIndex}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      width: getWidth(maxFileWidths[gameIndex]), // Use calculated width
                                      height: '40px',
                                      backgroundColor: isCorrect ? 'rgb(0, 120, 0)' : 'rgb(200, 0, 0)',
                                      color: 'black',
                                      fontSize: '12px',
                                      fontWeight: 'bold',
                                      border: '1px solid black',
                                    }}
                                  >
                                    {playerPick}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            'No Picks'
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3">No players available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
