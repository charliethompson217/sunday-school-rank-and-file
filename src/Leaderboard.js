import React, { useState } from 'react';
import {Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

import SeasonLeaderboard from './SeasonLeaderboard';
import WeeklyPicks from './WeeklyPicks';
import WeeklyLeaderboard from './WeeklyLeaderboard';

Amplify.configure(awsExports);

const Leaderboard = () => {
  const [activeChart, setActiveChart] = useState('seasonleaderboard');

  return (
    <div className='Leaderboard'>
      <div className='chart-tabs'>
        <button onClick={() => setActiveChart('seasonleaderboard')} className={activeChart === 'seasonleaderboard' ? 'active' : ''}> Season Leaderboard </button>
        <button onClick={() => setActiveChart('weeklyleaderboard')} className={activeChart === 'weeklyleaderboard' ? 'active' : ''}> Weekly Leaderboard </button>
        <button onClick={() => setActiveChart('weeklypicks')} className={activeChart === 'weeklypicks' ? 'active' : ''}> Weekly Picks </button>
      </div>
      
      {activeChart === 'seasonleaderboard' && (
        <SeasonLeaderboard></SeasonLeaderboard>
      )}
      {activeChart === 'weeklypicks' && (
        <WeeklyPicks></WeeklyPicks>
      )}
      {activeChart === 'weeklyleaderboard' && (
        <WeeklyLeaderboard></WeeklyLeaderboard>
      )}
    </div>
  );
};

export default Leaderboard;
