import React, { useState } from 'react';
import { API, Amplify, Auth } from 'aws-amplify';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

export default function UpdateWeeklyLeaderboard({players}) {
    const [file, setFile] = useState(null);
    const [warning, setWarning] = useState('');
    const [status, setStatus] = useState('');
    const [week, setWeek] = useState('Choose week');
    const weekOptions = [
        'Choose week', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10','Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16', 'Week 17', 'Week 18'
    ];

    const findPlayerId = (teamName) => {
        for(const player of players){
            if(teamName===player.teamName){
                return player.playerId;
            }
        }
        return false;
    }

    const sendToServer = async (data) => {
        try {
            const session = await Auth.currentSession();
            const idToken = session.getIdToken().getJwtToken();
            const response = await API.put('ssAdmin', `/admin/edit-${week}leaderboard`, {
                headers: {
                    Authorization: `Bearer ${idToken}`
                },
                body: {
                    data: data,
                }
            });
            console.log(response);
            setStatus(`${week} Leaderboard Updated!`);
        } catch (error) {
            console.error('Error uploading matchups:', error);
        }
    };

    const fetchGoogleSheetData = async () => {
        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();
        let response = await API.get('ssAdmin', `/admin/fetch-${week}leaderboard`, {
            headers: {
                Authorization: `Bearer ${idToken}`
            }
        });
        let newRows = [];
        let newRow = [];
        newRow.push("playerID");
        newRow.push("maximumPoints");
        newRow.push("missedPoints");
        newRow.push("weeklyBonus");
        newRow.push("perfectWeekBonus");
        newRow.push("earnedPoints");
        newRow.push("fileHolidayBonus");
        newRow.push("fileWins");
        newRow.push("totalRankGamesWon");
        newRow.push("playoffsBucksEarned");
        newRow.push("weeklyPayout");
        newRows.push(newRow);
        for (let item of response){
            if(item[0] === "" || item[0] === "Weekly Leaderboard" || item[0] === "Team"){
                continue;
            }
            newRow = [];
            newRow.push(findPlayerId(item[0]));
            for(let i = 2; i<item.length; i++){
                newRow.push(item[i]);
            }
            newRows.push(newRow);
        }
        sendToServer(newRows);
    };

    return (
        <div>
            <h2>Weekly Leaderboard</h2>
            <div>
                <label htmlFor="weekly-leaderboard-weekSelect">For Week:</label>
                <select id="weekly-leaderboard-weekSelect" value={week} onChange={(e) => setWeek(e.target.value)}>
                    {weekOptions.map((option) => (
                        <option key={option} value={option}>
                        {option}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <button onClick={fetchGoogleSheetData}>Fetch google sheet data</button>
            </div>
        </div>
    )
}