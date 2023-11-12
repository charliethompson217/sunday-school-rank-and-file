import React, { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

Amplify.configure(awsExports);

const PlayerTable = ({ fetchedPlayers }) => {
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [players, setPlayers] = useState(fetchedPlayers);

  useEffect(() => {
    setPlayers(fetchedPlayers);
  }, [fetchedPlayers]);

  const sortPlayers = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    return sortConfig.key === key ? (
      sortConfig.direction === 'ascending' ? (
        <FontAwesomeIcon icon={faArrowUp} />
      ) : (
        <FontAwesomeIcon icon={faArrowDown} />
      )
    ) : null;
  };

  useEffect(() => {
    let sortedPlayers = players;
    if (sortConfig !== null) {
      sortedPlayers.sort((a, b) => {
        // If sorting by TotalDollarPayout, parse the strings to numbers
        if (sortConfig.key === 'TotalDollarPayout') {
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
  }, [sortConfig]);

  const generateCsvData = () => {
    let csvData = '';
    csvData += 'Team Name,Full Name,Email';
    csvData += '\n';
    players.forEach((player) => {
      csvData += `${player.teamName},`;
      csvData += `${player.fullName},`;
      csvData += `${player.email},`;
      csvData += `${player.RankPoints},`;
      csvData += `${player.FileWins},`;
      csvData += `${player.PlayoffsBucks},`;
      csvData += `${player.TotalDollarPayout},`;
      csvData += '\n';
    })
    return csvData;
  };

  const downloadPlayerCSV = () => {
    const csvData = generateCsvData();
    if (csvData) {
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'players.csv';
      link.click();
    }
  };

  return (
    <div className='PlayerTable'>
      <h2>Players</h2>
      <div className='Admin' >
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
          {players.map(player => (
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