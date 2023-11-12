import React, { useState, useEffect } from 'react';
import { API, Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

Amplify.configure(awsExports);

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [activeChart, setActiveChart] = useState('seasonleaderboard');
  const [week, setWeek] = useState('Choose week');
  const weekOptions = [
    'Choose week', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16', 'Week 17', 'Week 18'
  ];
  const sortPlayers = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await API.get('playerApi', '/player/get-players');
        let sortedPlayers = [...response];
        sortedPlayers.sort((a, b) => {
          return b.teamName - a.teamName;
        });
        setPlayers(sortedPlayers);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };
    fetchPlayers();
  }, []);
  useEffect(() => {
    try {
      let sortedPlayers = players;
      if (sortConfig !== null) {
        sortedPlayers.sort((a, b) => {
          if (sortConfig.key === 'teamName') {
            const aValue = a[sortConfig.key].toLowerCase();
            const bValue = b[sortConfig.key].toLowerCase();
            if (aValue < bValue) {
              return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
              return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
          } else if (sortConfig.key === 'TotalDollarPayout') {
            const aValue = parseFloat(a[sortConfig.key].replace(/[\$,]/g, ''));
            const bValue = parseFloat(b[sortConfig.key].replace(/[\$,]/g, ''));
            return (aValue - bValue) * (sortConfig.direction === 'ascending' ? 1 : -1);
          } else {
            if (a[sortConfig.key] > b[sortConfig.key]) {
              return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] < b[sortConfig.key]) {
              return sortConfig.direction === 'ascending' ? 1 : -1;
            }
          }
          return 0;
        });
      }
      setPlayers(sortedPlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  }, [sortConfig, players]);



  const getSortIcon = (key) => {
    return sortConfig.key === key ? (
      sortConfig.direction === 'ascending' ? (
        <FontAwesomeIcon icon={faArrowUp} />
      ) : (
        <FontAwesomeIcon icon={faArrowDown} />
      )
    ) : null;
  };

  const changeChart = (chartName) => {
    setActiveChart(chartName);
  };

  return (
    <div className='PlayerTable'>
      <div className='chart-tabs'>
        {/* Render tabs for switching charts */}
        <button onClick={() => changeChart('seasonleaderboard')} className={activeChart === 'seasonleaderboard' ? 'active' : ''}>
          Season Leaderboard
        </button>
        <button onClick={() => changeChart('weeklyleaderboard')} className={activeChart === 'weeklyleaderboard' ? 'active' : ''}>
          Weekly Leaderboard
        </button>
        <button onClick={() => changeChart('weeklypicks')} className={activeChart === 'weeklypicks' ? 'active' : ''}>
          Weekly Picks
        </button>
        {/* Add more buttons for additional charts as needed */}
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
                Total Fictional-Dollar Payout {getSortIcon('TotalDollarPayout')}
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
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
      {activeChart === 'weeklyleaderboard' && (
        <div>
          <select className="week-select" value={week} onChange={(e) => setWeek(e.target.value)}>
            {weekOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p>Content for the weekly leaderboard...</p>
        </div>
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
          <p>Content for the weekly picks...</p>
        </div>
      )}

      {/* Render additional charts based on activeChart */}
    </div>
  );
};

export default Leaderboard;
