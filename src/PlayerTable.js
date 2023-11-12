import React, { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

Amplify.configure(awsExports);

const PlayerTable = ({ fetchedPlayers }) => {
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [sortedPlayers, setSortedPlayers] = useState([]);

  useEffect(() => {
    setSortedPlayers(fetchedPlayers); // Initialize sortedPlayers when fetchedPlayers changes
  }, [fetchedPlayers]);

  const sortPlayers = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    const newSortConfig = { key, direction };
    setSortConfig(newSortConfig);

    const playersToSort = [...fetchedPlayers]; // Sort based on the original fetched players
    playersToSort.sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === 'TotalDollarPayout') {
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

  const generateCsvData = () => {
    let csvData = 'Team Name,Full Name,Email,Rank Points,File Wins,Playoffs Bucks,Total Fictional-Dollar Payout\n';
    sortedPlayers.forEach((player) => {
      csvData += `${player.teamName},${player.fullName},${player.email},${player.RankPoints},${player.FileWins},${player.PlayoffsBucks},${player.TotalDollarPayout}\n`;
    });
    return csvData;
  };

  const downloadPlayerCSV = () => {
    const csvData = generateCsvData();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'players.csv';
    link.click();
  };

  return (
    <div className='PlayerTable'>
      <h2>Players</h2>
      <div className='Admin'>
        <button onClick={downloadPlayerCSV}>Download CSV</button>
      </div>
      <table className='player-table'>
        <thead>
          <tr>
            <th onClick={() => sortPlayers('teamName')} className='table-header'>
              Team {getSortIcon('teamName')}
            </th>
            <th onClick={() => sortPlayers('fullName')} className='table-header'>
              Full Name {getSortIcon('fullName')}
            </th>
            <th onClick={() => sortPlayers('email')} className='table-header'>
              Email {getSortIcon('email')}
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
          {sortedPlayers.map(player => (
            <tr key={player.playerId}>
              <td>{player.teamName}</td>
              <td>{player.fullName}</td>
              <td>{player.email}</td>
              <td>{player.RankPoints}</td>
              <td>{player.FileWins}</td>
              <td>{player.PlayoffsBucks}</td>
              <td>{player.TotalDollarPayout}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  );
}

export default PlayerTable;
