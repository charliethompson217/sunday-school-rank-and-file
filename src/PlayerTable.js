import React from 'react';
import {Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

const PlayerTable = ({players}) => {

  const generateCsvData = () => {
    let csvData = '';
    csvData += 'Team Name,Full Name,Email';
    csvData += '\n';
    players.forEach((player) => {
      const team = player.teamName;
      const name = player.fullName;
      const email = player.email;
      const RankPoints = player.RankPoints;
      const FileWins = player.FileWins;
      const PlayoffsBucks = player.PlayoffsBucks;
      const TotalDollarPayout = player.TotalDollarPayout;
      csvData += `${team},`;
      csvData += `${name},`;
      csvData += `${email},`;
      csvData += `${RankPoints},`;
      csvData += `${FileWins},`;
      csvData += `${PlayoffsBucks},`;
      csvData += `${TotalDollarPayout},`;
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
      <div>
        <button onClick={downloadPlayerCSV}>Download CSV</button>
      </div>
      <table className='player-table'>
        <thead>
          <tr>
            <th className='table-header'>Team Name</th>
            <th className='table-header'>Full Name</th>
            <th className='table-header'>Email</th>
            <th className='table-header'>Rank Points</th>
            <th className='table-header'>File Wins</th>
            <th className='table-header'>Playoffs Bucks</th>
            <th className='table-header'>Total Dollar Payout</th>
            
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