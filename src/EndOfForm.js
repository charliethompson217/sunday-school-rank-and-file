import React from 'react';

export default function EndOfForm({team, rankPicks, rankedRanks, filePicks}) {


  return (
    <div>
        <h3>End of Form</h3>
        <p>Thank you for making your picks. Your results are below.</p>
        <h3>Team:</h3>
        {team}
        <h3>Rank Picks:</h3>
        {JSON.stringify(rankPicks)}
        <h3>Ranked Rank Picks:</h3>
        {JSON.stringify(rankedRanks)}
        <h3>File Picks:</h3>
        {JSON.stringify(filePicks)}
    </div>
  )
}
