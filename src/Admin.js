import React from 'react';
import Configuration from './Configuration';
import PullPicks from './PullPicks';
import PlayerEditor from './PlayerEditor';

export default function Admin() {
  return (
    <div >
      <Configuration></Configuration>
      <PullPicks></PullPicks>
      <PlayerEditor></PlayerEditor>
    </div>
  );
}
