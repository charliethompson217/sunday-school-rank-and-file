import React from 'react';

export default function Playoffs({ handleSubmit, fetchedMatchupsResponse, picks, handlePickChange, warning, playoffsBucks, remainingPlayoffsBucks, parlayBet }) {
  return (
    <form onSubmit={handleSubmit}>
      <h1>You Have {playoffsBucks} Playoffs Bucks</h1>
      <h2>You Will Have {remainingPlayoffsBucks} Remaining</h2>
      <br></br>
      <h2>Spread Bets</h2>
      <br></br>
      {fetchedMatchupsResponse?.matchups?.map((matchup, idx) => {
        const currentPick = picks?.[idx] || {};
        return (
          <div key={idx} >
            <h4>{matchup.Away + " " + matchup.Odds*-1} @ {matchup.Home + " " + matchup.Odds}</h4>
            <label>
              <input
                type="checkbox"
                checked={currentPick.bet === "true" && currentPick.bet !== ''}
                onChange={(e) => handlePickChange(idx, 'bet', e.target.checked ? 'true' : 'false')}
              />
              place bet?
            </label>
            <select
              value={currentPick.winner || ''}
              onChange={(e) => handlePickChange(idx, 'winner', e.target.value)}
              hidden={currentPick.bet === 'false' || !currentPick.bet || currentPick.bet === '' || currentPick.bet === null} 
            >
              <option value="">Select winner</option>
              <option value={matchup.Home}>{matchup.Home}</option>
              <option value={matchup.Away}>{matchup.Away}</option>
            </select>
            <input
              type="number"
              placeholder="Enter wager"
              value={currentPick.wager || ''}
              onChange={(e) => handlePickChange(idx, 'wager', e.target.value)}
              hidden={currentPick.bet === 'false' || !currentPick.bet || currentPick.bet === '' || currentPick.bet === null} 
              style={{marginBottom: "40px"}}
            />
          </div>
        );
      })}
      {(fetchedMatchupsResponse?.week === "Wild Card Round" || fetchedMatchupsResponse?.week === "Divisional Round") && <div>
        <h2>Parley Bets</h2>
        {fetchedMatchupsResponse?.matchups?.map((matchup, idx) => {
            return (
            <div key={idx}>
                <label key={idx}> {matchup.Away + " " + matchup.Odds*-1} @ {matchup.Home + " " + matchup.Odds}
                    <span style={{color: "white", marginLeft: "20px"}}>Include In Parlay?</span>
                    <input type="checkbox" checked={picks[idx]?.parlay === 'true'?? false}
                        onChange={(e) => handlePickChange(idx, 'parlay', e.target.checked ? 'true' : 'false')}
                    ></input>
                    <select
                        value={picks[idx]?.parlayWinner || ''}
                        onChange={(e) => handlePickChange(idx, 'parlayWinner', e.target.value)}
                        hidden={!(picks[idx]?.parlay === 'true') ?? true} 
                    >
                        <option value="">Select winner</option>
                        <option value={matchup.Home}>{matchup.Home}</option>
                        <option value={matchup.Away}>{matchup.Away}</option>
                    </select>
                </label>
            </div>
          )
        })}
        {(parlayBet) && <input
            type="number"
            placeholder="Enter wager"
            value={picks[0]?.parlayWager || ''}
            onChange={(e) => handlePickChange(0, 'parlayWager', e.target.value)}
        />
        }
      </div>}
      <p className="warning">{warning}</p>
      <button type="submit">Submit</button>
    </form>
  );
}
