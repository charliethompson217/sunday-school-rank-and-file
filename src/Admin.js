import React from 'react';
import Configuration from './Configuration';
import PullPicks from './PullPicks';
import PlayerEditor from './PlayerEditor';

export default function Admin() {
  return (
    <div>
      <h1>Admin</h1>
      <Configuration></Configuration>
      <PullPicks></PullPicks>
      <PlayerEditor></PlayerEditor>
    </div>
  );
}
