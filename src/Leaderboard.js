import React, { useState, useEffect } from 'react';
import { API, Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);

  const compareByTotalDollarPayout = (a, b) => {
    const aValue = parseFloat(a.TotalDollarPayout.replace(/[$,]/g, '')) || 0;
    const bValue = parseFloat(b.TotalDollarPayout.replace(/[$,]/g, '')) || 0;
    return bValue - aValue;
  };
  
  useEffect( () => {
    const fetchPlayers = async () => {
      try {
        const response = await API.get('playerApi', '/player/get-players');
        const sortedPlayers = [...response].sort(compareByTotalDollarPayout);
        setPlayers(sortedPlayers);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    }
    fetchPlayers();
  }, []);

  return (
    <div className='PlayerTable'>
      <table className='player-table'>
        <thead>
          <tr>
            <th className='table-header'>Team</th>
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

export default Leaderboard;