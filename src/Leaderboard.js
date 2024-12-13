import React, { useState, useEffect } from 'react';
import SeasonLeaderboard from './SeasonLeaderboard';
import WeeklyPicks from './WeeklyPicks';
import WeeklyLeaderboard from './WeeklyLeaderboard';
import PlayerPointsGraph from './PlayerPointsGraph';
import PlayerRankGraph from './PlayerRankGraph';
import PlayerWeeklyStandingsgraph from './PlayerWeeklyStandingsgraph';
import WeeklyPointsGraph from './WeeklyPointsGraph';


export default function Leaderboard() {
  const [activeChart, setActiveChart] = useState('seasonleaderboard');
  const tabs = ['seasonleaderboard', 'weeklyleaderboard', 'weeklypicks', 'graphs'];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleKeyDown = (event) => {
    const currentIndex = tabs.indexOf(activeChart);

    if (event.key === 'ArrowRight') {
      const nextIndex = (currentIndex + 1) % tabs.length;
      setActiveChart(tabs[nextIndex]);
      window.scrollTo(0, 0);
    } else if (event.key === 'ArrowLeft') {
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      setActiveChart(tabs[prevIndex]);
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  return (
    <div className='Leaderboard'>
      <div className='chart-tabs'>
        <button onClick={() => setActiveChart('seasonleaderboard')} className={activeChart === 'seasonleaderboard' ? 'active' : ''}>
          Season Leaderboard
        </button>
        <button onClick={() => setActiveChart('weeklyleaderboard')} className={activeChart === 'weeklyleaderboard' ? 'active' : ''}>
          Weekly Leaderboard
        </button>
        <button onClick={() => setActiveChart('weeklypicks')} className={activeChart === 'weeklypicks' ? 'active' : ''}>
          Weekly Picks
        </button>
        <button onClick={() => setActiveChart('graphs')} className={activeChart === 'graphs' ? 'active' : ''}>
          Graphs
        </button>
      </div>


      <div className={activeChart}>
        {activeChart === 'seasonleaderboard' && (
          <SeasonLeaderboard></SeasonLeaderboard>
        )}
      </div>

      <div className={activeChart}>
        {activeChart === 'weeklypicks' && (
          <WeeklyPicks></WeeklyPicks>
        )}
      </div>

      <div className={activeChart}>
        {activeChart === 'weeklyleaderboard' && (
          <WeeklyLeaderboard></WeeklyLeaderboard>
        )}
      </div>

      <div className={activeChart}>
        {activeChart === 'graphs' && (
          <PlayerRankGraph></PlayerRankGraph>
        )}
      </div>

      <div className={activeChart}>
        {activeChart === 'graphs' && (
          <PlayerWeeklyStandingsgraph></PlayerWeeklyStandingsgraph>
        )}
      </div>

      <div className={activeChart}>
        {activeChart === 'graphs' && (
          <PlayerPointsGraph></PlayerPointsGraph>
        )}
      </div>

      <div className={activeChart}>
        {activeChart === 'graphs' && (
          <WeeklyPointsGraph></WeeklyPointsGraph>
        )}
      </div>

    </div>
  );
};