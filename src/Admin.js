import React, { useState, useEffect } from 'react';
import { API, Amplify, Auth } from 'aws-amplify';
import awsExports from './aws-exports';
import Configuration from './Configuration';
import PullPicks from './PullPicks';
import PlayerTable from './PlayerTable';
import Points from './Points';

Amplify.configure(awsExports);

export default function Admin() {

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

  return (
    <div >
      <Configuration></Configuration>
      <Points players={players}></Points>
      <PullPicks players={players}></PullPicks>
      <PlayerTable players={players}></PlayerTable>
    </div>
  );
}
