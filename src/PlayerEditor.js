import React, { useState, useEffect } from 'react';
import { API, Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

const PlayerEditor = () => {
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerEmail, setNewPlayerEmail] = useState('');

  const compareByTeamName = (a, b) => {
    if (a.teamName < b.teamName) return -1;
    if (a.teamName > b.teamName) return 1;
    return 0;
  };

  useEffect( () => {
    const fetchPlayers = async () => {
      const response = await API.get('playerApi', '/player/get-players');
      const sortedPlayers = [...response].sort(compareByTeamName);
    setPlayers(sortedPlayers);
    }
    fetchPlayers();
  }, []);

  const makeId = (length) => {
    let result = 'SSP';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  const handleAddPlayer = async () => {
    if (newPlayerName.trim() !== '') {
      const newId = makeId(7);
      const response = await API.post('playerApi', `/player/${newId}`,{
        body: {
          email: newPlayerEmail,
          teamName: newPlayerName,
        }
      });
      console.log(response);
      const teamWithoutSpaces = newPlayerName.split(' ').join('');
      const response2 = await API.post('sundaySchoolSubmissions', `/submission/${teamWithoutSpaces}`, {
        body: {
          team: teamWithoutSpaces,
          configId: "1",
        }
      });
      console.log(response2);
      setPlayers([...players, { playerId: newId, teamName: newPlayerName, email: newPlayerEmail}]);
      setNewPlayerName('');
      setNewPlayerEmail('');
    }
  };

  const handleRemovePlayer = async (oldPlayer) => {
    if (window.confirm(`Are you sure you want to delete ${oldPlayer.teamName}? This action cannot be undone!`)) {
      const response = await API.del('playerApi', `/player/${oldPlayer.playerId}`,{
        body: {
          Timestamp: oldPlayer.Timestamp,
        }
      });
      console.log(response);
      const updatedPlayers = players.filter(player => player.playerId !== oldPlayer.playerId);
      setPlayers(updatedPlayers);
    }
  };

  const handleEditPlayerName = async (oldPlayer, newName) => {
    const updatedPlayers = players.map(player => {
      if (player.playerId === oldPlayer.playerId) {
        return { ...player, teamName: newName };
      }
      return player;
    });
    setPlayers(updatedPlayers);
  };
  const handleEditPlayerEmail = async (oldPlayer, newEmail) => {
    const updatedPlayers = players.map(player => {
      if (player.playerId === oldPlayer.playerId) {
        return { ...player, email: newEmail };
      }
      return player;
    });
    setPlayers(updatedPlayers);
  };
  const handlePushEdits = async (player) => {
    if (window.confirm(`Are you sure you want to edit ${player.teamName}? If this player has already submitted their picks this week, these picks will no longer be asociated with the curent week's matchups!`)) {
      const response = await API.put('playerApi', `/player/${player.playerId}`,{
        body: {
          email: player.email,
          teamName: player.teamName,
          Timestamp: player.Timestamp,
        }
      });
      console.log(response);
      const teamWithoutSpaces = player.teamName.split(' ').join('');
      const response2 = await API.post('sundaySchoolSubmissions', `/submission/${teamWithoutSpaces}`, {
        body: {
          team: teamWithoutSpaces,
          configId: "1",
        }
      });
      console.log(response2);
    }
  };


  return (
    <div className='PlayerEditor'>
      <h2>Player Editor</h2>
      <p>(Does not affect previous weeks' picks, but if the player has already submitted their picks this week, these picks will no longer be asociated with the curent week's matchups)</p>
      <ul>
        {players.map(player => (
          <li key={player.playerId}>

            <div className="PlayerEditor-input-wrapper">
              <label>TeamName:</label>
              <input
                type="text"
                value={player.teamName}
                onChange={e => handleEditPlayerName(player, e.target.value)}
              />
            </div>

            <div className="PlayerEditor-input-wrapper">
              <label>Email:</label>
              <input
                type="text"
                value={player.email}
                onChange={e => handleEditPlayerEmail(player, e.target.value)}
              />
            </div>

            <div>
              <label>PlayerID:</label>
              <label>{player.playerId}</label>
            </div>

            <div>
              <button onClick={() => handlePushEdits(player)}>Push Edits</button>
              <button onClick={() => handleRemovePlayer(player)}>Remove</button>
            </div>

          </li>
        ))}
      </ul>
      <div>
        <input
          type="text"
          placeholder="Enter player name"
          value={newPlayerName}
          onChange={e => setNewPlayerName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter player email"
          value={newPlayerEmail}
          onChange={e => setNewPlayerEmail(e.target.value)}
        />
        <button onClick={handleAddPlayer}>Add Player</button>
      </div>
    </div>
  );
};

export default PlayerEditor;
