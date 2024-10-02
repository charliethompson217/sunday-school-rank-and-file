import React, { useContext } from 'react';
import { API, Amplify, Auth } from 'aws-amplify';
import awsExports from './aws-exports';
import UpdateMatchups from './UpdateMatchups';
import PullPicks from './PullPicks';
import PlayerTable from './PlayerTable';
import UpdateSeasonLeaderboard from './UpdateSeasonLeaderboard';
import UpdateWeeklyLeaderboard from './UpdateWeeklyLeaderboard';
import GameResults from './Game-Results';
import { DataContext } from './DataContext';

Amplify.configure(awsExports);

export default function Admin() {

  const { fetchedAdminPlayers } = useContext(DataContext);

  return (
    <div style={{ minWidth: '800px' }}>
      <div  style={{ display: 'flex', marginBottom: '20px' }}>
        <div className='Admin' style={{ width: '30%' }}>
          <UpdateMatchups />
          <UpdateSeasonLeaderboard players={fetchedAdminPlayers} />
          <UpdateWeeklyLeaderboard players={fetchedAdminPlayers} />
          <PullPicks players={fetchedAdminPlayers} />
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
}
