import React, { useState, useEffect, useContext } from 'react';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { DataContext } from './DataContext';

Amplify.configure(awsExports);

const WeeklyLeaderboard = () => {
  const { fetchedPlayers, fetchedWeeklyLeaderboards, fetchedCurWeek } = useContext(DataContext);
  const [sortedPlayers, setSortedPlayers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'RankPoints', direction: 'descending' });
  const [week, setWeek] = useState('Choose week');
  const weekOptions = [
    'Choose week', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8',
    'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16', 'Week 17', 'Week 18'
  ];

  const getTeamName = (playerId) => {
    const player = fetchedPlayers.find(p => p.playerId === playerId);
    if (player) {
      return player.teamName;
    } else {
      return null;
    }
  };

  useEffect(() => {
    if (fetchedPlayers && fetchedPlayers.length > 0) {
      const playersToSort = [...fetchedPlayers];
      playersToSort.sort((a, b) => {
        let aValue = parseFloat(a['RankPoints']);
        let bValue = parseFloat(b['RankPoints']);
        return bValue - aValue;
      });
      setSortedPlayers(playersToSort);
    }
  }, [fetchedPlayers]);

  function decrementLastNumber(str) {
    return str?.replace(/\d+$/, (num) => parseInt(num, 10) - 1) || 'Choose week';
  };

  useEffect(() => {
    if(fetchedCurWeek){
      setWeek(decrementLastNumber(fetchedCurWeek));
    }
  }, [fetchedCurWeek]);

  useEffect(() => {
    if (fetchedPlayers && fetchedPlayers.length > 0 && fetchedWeeklyLeaderboards && fetchedCurWeek) {
      const leaderboardForSelectedWeek = fetchedWeeklyLeaderboards.find(w => w.Week === week);
      if (leaderboardForSelectedWeek) {
        const updatedLeaderboard = leaderboardForSelectedWeek.data
          .map(playerData => {
            const playerID = playerData[0];
            const teamName = getTeamName(playerID);
            if (teamName !== null) {
              return {
                playerId: playerID,
                teamName,
                maximumPoints: playerData[1],
                missedPoints: playerData[2],
                weeklyBonus: playerData[3],
                perfectWeekBonus: playerData[4],
                earnedPoints: playerData[5],
                fileHolidayBonus: playerData[6],
                fileWins: playerData[7],
                totalRankGamesWon: playerData[8],
                playoffsBucksEarned: playerData[9],
                weeklyPayout: playerData[10],
              };
            }
            return null;
          })
          .filter(player => player !== null);
    
        const playersToSort = [...updatedLeaderboard];
          playersToSort.sort((a, b) => {
            let aValue = parseFloat(a['maximumPoints']);
            let bValue = parseFloat(b['maximumPoints']);
            return bValue - aValue;
          });
      
        setSortedPlayers(playersToSort);
      }
    }
  }, [fetchedPlayers, fetchedWeeklyLeaderboards, fetchedCurWeek, week]);
  
  
  const sortPlayers = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    if (key === 'maximumPoints' || key === 'missedPoints' || key === 'earnedPoints' || key === 'fileWins' || key === 'totalRankGamesWon' || key === 'playoffsBucksEarned' || key === 'weeklyPayout'){
      direction = 'descending';
      if (sortConfig.key === key && sortConfig.direction === 'descending') {
        direction = 'ascending';
      }
    }

    setSortConfig({ key, direction });

    const playersToSort = [...sortedPlayers];
    playersToSort.sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === 'maximumPoints' || key === 'missedPoints' || key === 'earnedPoints' || key === 'fileWins' || key === 'totalRankGamesWon' || key === 'playoffsBucksEarned' || key === 'weeklyPayout') {
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

  return (
    <div>
      <select className="week-select" value={week} onChange={(e) => setWeek(e.target.value)}>
        {weekOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <table className='player-table weekly-leaderboard'>
        <thead>
          <tr>
            <th onClick={() => sortPlayers('teamName')} className='table-header'>
              Team {getSortIcon('teamName')}
            </th>
            <th onClick={() => sortPlayers('maximumPoints')} className='table-header'>
              Maximum Points {getSortIcon('maximumPoints')}
            </th>
            <th onClick={() => sortPlayers('missedPoints')} className='table-header'>
              Missed Points {getSortIcon('missedPoints')}
            </th>
            <th onClick={() => sortPlayers('weeklyBonus')} className='table-header'>
              Weekly Bonus {getSortIcon('weeklyBonus')}
            </th>
            <th onClick={() => sortPlayers('perfectWeekBonus')} className='table-header'>
              Perfect Week Bonus {getSortIcon('perfectWeekBonus')}
            </th>
            <th onClick={() => sortPlayers('earnedPoints')} className='table-header'>
              Earned Points {getSortIcon('earnedPoints')}
            </th>
            <th onClick={() => sortPlayers('fileHolidayBonus')} className='table-header'>
              File Holiday Bonus {getSortIcon('fileHolidayBonus')}
            </th>
            <th onClick={() => sortPlayers('fileWins')} className='table-header'>
              File Wins {getSortIcon('fileWins')}
            </th>
            <th onClick={() => sortPlayers('totalRankGamesWon')} className='table-header'>
              Total Rank Games Won {getSortIcon('totalRankGamesWon')}
            </th>
            <th onClick={() => sortPlayers('playoffsBucksEarned')} className='table-header'>
              Playoffs Bucks Earned {getSortIcon('playoffsBucksEarned')}
            </th>
            <th onClick={() => sortPlayers('weeklyPayout')} className='table-header'>
              Weekly Payout {getSortIcon('weeklyPayout')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers && sortedPlayers.length > 0 ? (
            sortedPlayers.map(player => {
              return (
                <tr key={player.playerId}>
                  <td>{player.teamName}</td>
                  <td>{player.maximumPoints}</td>
                  <td>{player.missedPoints}</td>
                  <td>{player.weeklyBonus}</td>
                  <td>{player.perfectWeekBonus}</td>
                  <td>{player.earnedPoints}</td>
                  <td>{player.fileHolidayBonus}</td>
                  <td>{player.fileWins}</td>
                  <td>{player.totalRankGamesWon}</td>
                  <td>{player.playoffsBucksEarned}</td>
                  <td>{player.weeklyPayout}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="11">No players available</td>
            </tr>
          )}
        </tbody>

      </table>
    </div>
  );
};

export default WeeklyLeaderboard;
