import React, { useState, useEffect, useContext } from 'react';
import {Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { DataContext } from './DataContext';

Amplify.configure(awsExports);

const SeasonLeaderboard = () => {
  const { fetchedPlayers} = useContext(DataContext);
  const [sortedPlayers, setSortedPlayers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

  useEffect(() => {
    setSortedPlayers(fetchedPlayers);
  }, [fetchedPlayers]);

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

  return (
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
  );
};

export default SeasonLeaderboard;
