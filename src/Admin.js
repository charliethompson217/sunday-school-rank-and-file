import React, { useContext, useEffect } from 'react';
import UpdateMatchups from './UpdateMatchups';
import PullPicks from './PullPicks';
import PlayerTable from './PlayerTable';
import UpdateSeasonLeaderboard from './UpdateSeasonLeaderboard';
import UpdateWeeklyLeaderboard from './UpdateWeeklyLeaderboard';
import GameResults from './Game-Results';
import { DataContext } from './DataContext';

export default function Admin() {
  const { fetchedAdminPlayers } = useContext(DataContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ minWidth: '800px' }}>
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <div className='Admin' style={{ width: '30%' }}>
          <UpdateMatchups />
          <UpdateSeasonLeaderboard players={fetchedAdminPlayers} />
          <UpdateWeeklyLeaderboard players={fetchedAdminPlayers} />
          <PullPicks />
        </div>
        <div>
          <GameResults />
        </div>
      </div>

      <div style={{ width: '100%' }}>
        <PlayerTable fetchedPlayers={fetchedAdminPlayers} />
      </div>
    </div>
  );
};