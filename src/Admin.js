import React from 'react';
import Configuration from './Configuration';
import PullPicks from './PullPicks';
import PlayerTable from './PlayerTable';

export default function Admin() {
  return (
    <div >
      <Configuration></Configuration>
      <PullPicks></PullPicks>
      <PlayerTable></PlayerTable>
    </div>
  );
}
