import React, { useState, useEffect } from 'react';
import { API, Amplify, Auth } from 'aws-amplify';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

const PlayerEditor = () => {
  const [players, setPlayers] = useState([]);
  const [newPlayerEmail, setNewPlayerEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');

  const compareByTeamName = (a, b) => {
    if (a.teamName < b.teamName) return -1;
    if (a.teamName > b.teamName) return 1;
    return 0;
  };

  useEffect( () => {
    const fetchPlayers = async () => {
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      const response = await API.get('ssAdmin', '/admin/get-players',{
        headers: {
          Authorization: `Bearer ${idToken}`
        },
      });
      const sortedPlayers = [...response].sort(compareByTeamName);
    setPlayers(sortedPlayers);
    }
    fetchPlayers();
  }, []);

  const handleInvitePlayer = () => {
      setNewPlayerEmail('');
      setNewFullName('');
  };

  const generateCsvData = () => {
    let csvData = '';
    csvData += 'PlayerId,Team Name,Full Name,Email';
    csvData += '\n';
    players.forEach((player) => {
      const id = player.playerId;
      const team = player.teamName;
      const name = player.fullName;
      const email = player.email;
      csvData += `${id},`;
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
    <div className='PlayerEditor'>
      <h2>Players</h2>
      <div>
        <button onClick={downloadPlayerCSV}>Download CSV</button>
      </div>
      <ul>
        {players.map(player => (
          <li key={player.playerId}>

            <div className="PlayerEditor-input-wrapper">
              <label>TeamName:</label>
              <label>{player.teamName}</label>
            </div>

            <div className="PlayerEditor-input-wrapper">
              <label>Email:</label>
              <label>{player.email}</label>
            </div>
            <div className="PlayerEditor-input-wrapper">
              <label>Full Name:</label>
              <label>{player.fullName}</label>
            </div>

            <div>
              <label>PlayerID:</label>
              <label>{player.playerId}</label>
            </div>
          </li>
        ))}
      </ul>
      <div>
        <input
          type="text"
          placeholder="Email"
          value={newPlayerEmail}
          onChange={e => setNewPlayerEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Full Name"
          value={newFullName}
          onChange={e => setNewFullName(e.target.value)}
        />
        <button onClick={handleInvitePlayer}>Invite Player</button>
        
      </div>
    </div>
  );
}

export default PlayerEditor;