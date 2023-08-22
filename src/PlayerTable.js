import React, { useState, useEffect } from 'react';
import { API, Amplify, Auth } from 'aws-amplify';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

const PlayerTable = () => {
  const [players, setPlayers] = useState([]);

  const compareByTeamName = (a, b) => {
    if (a.teamName < b.teamName) return -1;
    if (a.teamName > b.teamName) return 1;
    return 0;
  };

  useEffect( () => {
    const fetchPlayers = async () => {
      try {
        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();
        const response = await API.get('ssAdmin', '/admin/get-players',{
          headers: {
            Authorization: `Bearer ${idToken}`
          },
        });
        const sortedPlayers = [...response].sort(compareByTeamName);
        setPlayers(sortedPlayers);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
      
    }
    fetchPlayers();
  }, []);

  const generateCsvData = () => {
    let csvData = '';
    csvData += 'Team Name,Full Name,Email';
    csvData += '\n';
    players.forEach((player) => {
      const team = player.teamName;
      const name = player.fullName;
      const email = player.email;
      csvData += `${team},`;
      csvData += `${name},`;
      csvData += `${email},`;
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
          </tr>
        </thead>
        <tbody>
          {players.map(player => (
            <tr key={player.playerId}>
              <td>{player.teamName}</td>
              <td>{player.fullName}</td>
              <td>{player.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PlayerTable;