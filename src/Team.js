import React from 'react'

export default function Team({team, teams, onTeamChange}) {
  return (
    <div>
        <div>
            <p>Who are you? You should have received a unique link, but this question helps verify that your picks are associated with the correct player. Do not submit picks for another player using your unique link.</p>
            <label htmlFor="teamSelect">Select Team:</label>
            <select id="teamSelect" value={team} onChange={(e) => onTeamChange(e.target.value)}>
            {teams.map((option) => (
                <option key={option} value={option}>
                {option}
                </option>
            ))}
            </select>
        </div>
    </div>
  )
}
