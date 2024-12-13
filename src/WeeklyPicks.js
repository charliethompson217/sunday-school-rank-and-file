import React, { useState, useEffect, useContext } from 'react';
import { DataContext } from './DataContext';
import logoMap from './assets/logos';

function keepLastWord(inputString) {
  if (typeof inputString !== 'string' || inputString.trim() === '') {
    return '';
  }
  const words = inputString.split(' ');
  return words[words.length - 1];
};

const isPickCorrect = (game, results, gameIndex) => {
  if (!results?.[gameIndex]?.value) {
    return 'undecided';
  }

  const playerPick = keepLastWord(game?.value);
  const resultPick = keepLastWord(results?.[gameIndex]?.value);

  if (playerPick === resultPick) {
    return 'correct';
  } if (resultPick === 'Tie') {
    return 'tie';
  } else {
    return 'incorrect';
  }
};

const weekOptions = [
  'Choose week', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16', 'Week 17', 'Week 18', 'Wild Card Round', 'Divisional Round', 'Conference Round', 'Super Bowl'
];

export default function WeeklyPicks() {
  const { fetchedCurWeek, fetchedPlayers, fetchedSubmissions, fetchedGameResults } = useContext(DataContext);
  const [sortedPlayers, setSortedPlayers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState({});
  const [week, setWeek] = useState('Choose week');
  const [gameResults, setGameResults] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleKeyDown = (event) => {
    event.preventDefault();
    const currentIndex = weekOptions.indexOf(week);

    if (event.key === 'ArrowDown') {
      const nextIndex = (currentIndex + 1) % weekOptions.length;
      if (submissions?.[nextIndex])
        setWeek(weekOptions[nextIndex]);
    } else if (event.key === 'ArrowUp') {
      const prevIndex = (currentIndex - 1 + weekOptions.length) % weekOptions.length;
      if (submissions?.[prevIndex])
        setWeek(weekOptions[prevIndex]);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  const fixRankedRanks = (array) => {
    array.reverse();
    let newArray = [...array];
    for (let i = 0; i < newArray.length; i++) {
      newArray[array[i] - 1] = i + 1;
    }
    return newArray;
  };

  function decrementLastNumber(week) {
    const weekNumber = week ? parseInt(week.split(' ')[1]) : NaN;
    if (!isNaN(weekNumber)) {
      return week?.replace(/\d+$/, (num) => parseInt(num, 10) - 1) || 'Choose week';
    } else if (week === 'Wild Card Round'){
      return 'Week 18';
    } else if (week === 'Divisional Round'){
      return 'Wild Card Round';
    } else if (week === 'Conference Round'){
      return 'Divisional Round';
    } else if (week === 'Super Bowl'){
      return 'Conference Round';
    } else if (week === 'Post-Season'){
      return 'Super Bowl';
    }
  };

  useEffect(() => {
    if (fetchedPlayers && fetchedPlayers.length > 0) {
      const playersToSort = fetchedPlayers
        .filter(player => player.RankPoints !== null && player.RankPoints !== undefined)
        .map(player => ({ ...player, RankPoints: parseFloat(player.RankPoints) }));
      setSortedPlayers(playersToSort);
    }
    else {
      setSortedPlayers(fetchedPlayers || []);
    }

    setSubmissions(fetchedSubmissions || []);
    setWeek(decrementLastNumber(fetchedCurWeek));
    setGameResults(fetchedGameResults || []);
  }, [fetchedPlayers, fetchedSubmissions, fetchedCurWeek, fetchedGameResults]);

  useEffect(() => {
    if (week !== 'Choose week') {
      const weekNumber = week.split(' ')[1];
      const weekIndex = parseInt(weekNumber, 10) - 1;

      const weekSubmissions = submissions?.[weekIndex] || [];

      const submissionsByPlayer = weekSubmissions.reduce((acc, submission) => {
        if (submission?.playerId) {
          const rankRanks = submission?.rankedRanks ? JSON.parse(submission.rankedRanks) : [];

          const fixedRankedRanks = fixRankedRanks(rankRanks);

          acc[submission.playerId] = {
            ...submission,
            rankedRanks: JSON.stringify(fixedRankedRanks)
          };
        }
        return acc;
      }, {});

      setFilteredSubmissions(submissionsByPlayer);
    }
  }, [week, submissions]);

  const calculateMaxColumnWidths = (players) => {
    if (!Array.isArray(players) || players.length === 0) {
      return { maxRankWidths: [], maxFileWidths: [] };
    }
    const maxRankWidths = [];
    const maxFileWidths = [];

    players.forEach((player) => {
      const submission = filteredSubmissions?.[player?.playerId];
      const rankPicks = submission?.rankPicks ? JSON.parse(submission.rankPicks) : [];
      const filePicks = submission?.filePicks ? JSON.parse(submission.filePicks) : [];
      const rankRanks = submission?.rankedRanks ? JSON.parse(submission.rankedRanks) : [];

      rankPicks.forEach((rank, index) => {
        const combinedLength = (rankRanks?.[index]?.length || 0) + (keepLastWord(rank?.value)?.length || 0) + 3;
        if (!maxRankWidths[index] || combinedLength > maxRankWidths[index]) {
          maxRankWidths[index] = combinedLength;
        }
      });

      filePicks.forEach((file, index) => {
        const combinedLength = keepLastWord(file?.value)?.length || 0;
        if (!maxFileWidths[index] || combinedLength > maxFileWidths[index]) {
          maxFileWidths[index] = combinedLength;
        }
      });
    });

    return { maxRankWidths, maxFileWidths };
  };

  const { maxRankWidths, maxFileWidths } = calculateMaxColumnWidths(sortedPlayers);

  const getWidth = () => '80px';

  useEffect(() => {
    const calculatePoints = (submission, currentWeekResults) => {
      const rankPicks = submission?.rankPicks ? JSON.parse(submission.rankPicks) : [];
      const rankRanks = submission?.rankedRanks ? JSON.parse(submission.rankedRanks) : [];
      const rankResults = currentWeekResults?.rankResults || [];

      let totalPoints = 0;

      rankPicks.forEach((game, gameIndex) => {
        if (isPickCorrect(game, rankResults, gameIndex) === 'correct' || isPickCorrect(game, rankResults, gameIndex) === 'tie' || isPickCorrect(game, rankResults, gameIndex) === 'undecided') {
          totalPoints += parseInt(rankRanks?.[gameIndex], 10) || 0;
        }
      });

      // check for bonus
      let checkBonus = 0;
      let bonusGames = [];
      rankPicks.forEach((game, gameIndex) => {
        if (parseInt(rankRanks?.[gameIndex], 10) > 5)
          return;
        if (isPickCorrect(game, rankResults, gameIndex) === 'correct' || isPickCorrect(game, rankResults, gameIndex) === 'undecided') {
          checkBonus++;
          bonusGames.push(gameIndex);
        }
      });
      if (checkBonus === 5)
        totalPoints += 20;
      else
        bonusGames = [];

      // check perfect sunday
      checkBonus = 0;
      rankPicks.forEach((game, gameIndex) => {
        if (isPickCorrect(game, rankResults, gameIndex) === 'correct' || isPickCorrect(game, rankResults, gameIndex) === 'undecided') {
          checkBonus++;
        }
      });
      if (checkBonus === rankPicks.length && rankPicks.length > 0)
        totalPoints += 40;


      return { totalPoints, bonusGames };
    };

    if (filteredSubmissions && gameResults?.[week]) {
      setSortedPlayers((prevSortedPlayers) => {
        const currentWeekResults = gameResults?.[week] || {};
        const playersWithPoints = prevSortedPlayers.map(player => {
          const submission = filteredSubmissions?.[player?.playerId];
          const { totalPoints, bonusGames } = calculatePoints(submission, currentWeekResults);
          return { ...player, totalPoints, bonusGames };
        });
        return playersWithPoints.sort((a, b) => b.totalPoints - a.totalPoints);
      });
    }
    else if (filteredSubmissions && !gameResults?.[week]) {

      setSortedPlayers((prevSortedPlayers) => {
        return prevSortedPlayers.map(player => {
          const ranks = filteredSubmissions?.[player?.playerId]?.rankedRanks ? JSON.parse(filteredSubmissions?.[player?.playerId]?.rankedRanks) : [];
          let totalPoints = 0;
          for (let i = 0; i < ranks.length; i++) {
            totalPoints += (i + 1);
          }
          totalPoints += 60;
          return { ...player, totalPoints };
        });
      });

    }
  }, [filteredSubmissions, gameResults, week]);



  function changeWeek(value) {
    if (submissions?.[weekOptions.indexOf(value)])
      setWeek(value);
  };
  const secondaryButtonColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-button-color').trim();
  return (
    <div>
      <select className="week-select" value={week} onChange={(e) => changeWeek(e.target.value)}>
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
              <th style={{ padding: '10px', whiteSpace: 'nowrap', color: 'black', backgroundColor: `${secondaryButtonColor}`, borderRadius: '10px 0px 0px 10px', height: '30px', border: 'none' }}>Team (points)</th>
              <th style={{ padding: '10px', whiteSpace: 'nowrap', color: 'black', backgroundColor: `${secondaryButtonColor}`, borderRadius: '0px 0px 0px 0px', height: '30px', border: 'none' }}>Rank Picks</th>
              <th style={{ paddingRight: '100px', paddingLeft: '65px', whiteSpace: 'nowrap', color: 'black', backgroundColor: `${secondaryButtonColor}`, borderRadius: '0px 10px 10px 0px', height: '30px', border: 'none' }}>File Picks</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers && sortedPlayers.length > 0 ? (
              sortedPlayers.map((player, index) => {
                const submission = filteredSubmissions?.[player?.playerId];
                const rankPicks = submission?.rankPicks ? JSON.parse(submission.rankPicks) : [];
                const filePicks = submission?.filePicks ? JSON.parse(submission.filePicks) : [];
                const rankRanks = submission?.rankedRanks ? JSON.parse(submission.rankedRanks) : [];
                const currentWeekResults = gameResults?.[week] || {};
                const rankResults = currentWeekResults?.rankResults || [];
                const fileResults = currentWeekResults?.fileResults || [];

                return (
                  <tr key={player.playerId}>
                    <td
                      style={{
                        verticalAlign: 'middle',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        paddingRight: '10px',
                        paddingLeft: '10px',
                        color: 'black',
                        height: '80px',
                        borderRadius: '10px 0px 0px 10px',
                        fontSize: '20px',
                        backgroundColor: `${secondaryButtonColor}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <span style={{ marginLeft: '15px' }}> {player?.teamName} </span>
                      <span style={{
                        color: 'black',
                        padding: '5px',
                        marginRight: '3px',
                        marginLeft: '5px',
                        fontSize: '40px',
                        textAlign: 'right'
                      }}>
                        {player?.totalPoints}
                      </span>
                    </td>
                    <td>
                      {Array.isArray(rankPicks) && rankPicks.length > 0 ? (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: rankPicks.map((_, gameIndex) => getWidth(maxRankWidths[gameIndex])).join(' '),
                          gap: '2px'
                        }}>
                          {rankPicks.map((game, gameIndex) => {
                            const playerPick = keepLastWord(game?.value);
                            const teamLogo = logoMap[playerPick];
                            const isBonusGame = player?.bonusGames?.includes(gameIndex);
                            return (
                              <div
                                key={gameIndex}
                                className={isPickCorrect(game, rankResults, gameIndex)}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  width: getWidth(maxRankWidths[gameIndex]),
                                  height: '80px',
                                  color: 'rgb(0,0,0)',
                                  fontSize: '10px',
                                  fontWeight: '800',
                                  letterSpacing: '1px',
                                }}
                              >
                                <img
                                  src={teamLogo}
                                  alt={`${playerPick} logo`}
                                  style={{ width: '40px', height: '40px', marginBottom: '5px' }}
                                />
                                <span style={{
                                  backgroundColor: isBonusGame
                                    ? 'rgba(0,0,0,0.35)'
                                    : 'rgba(130, 130, 130, 0.35)',
                                  borderRadius: '10px',
                                  color: isBonusGame
                                    ? 'rgba(255,255,255,0.35)'
                                    : 'rgba(0, 0, 0, 0.55)',
                                  padding: '3px',
                                  marginBottom: '3px',
                                  fontSize: '20px',
                                }}>
                                  {rankRanks?.[gameIndex]}
                                </span>
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
                          gridTemplateColumns: filePicks.map((_, gameIndex) => getWidth(maxFileWidths[gameIndex])).join(' '),
                          gap: '2px',
                        }}>
                          {filePicks.map((game, gameIndex) => {
                            const playerPick = keepLastWord(game?.value);
                            const teamLogo = logoMap[playerPick];
                            return (
                              <div
                                key={gameIndex}
                                className={isPickCorrect(game, fileResults, gameIndex)}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  width: getWidth(maxFileWidths[gameIndex]),
                                  height: '80px',
                                  color: 'rgb(0,0,0)',
                                  fontSize: '10px',
                                  fontWeight: '800',
                                  letterSpacing: '1px',
                                }}
                              >
                                <img
                                  src={teamLogo}
                                  alt={`${playerPick} logo`}
                                  style={{ width: '40px', height: '40px', marginBottom: '5px' }}
                                />

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
  );
};