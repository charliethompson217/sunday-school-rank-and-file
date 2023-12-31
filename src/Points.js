import React, { useState } from 'react';
import { API, Amplify, Auth } from 'aws-amplify';
import Papa from 'papaparse';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

export default function Points({players}) {
    const [file, setFile] = useState(null);
    const [warning, setWarning] = useState('');

    const findPlayerId = (teamName) => {
        for(const player of players){
            if(teamName===player.teamName){
                return player.playerId;
            }
        }
        return false;
    }

    const sendToServer = async (players) => {
    try {
        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();
        await API.put('ssAdmin', '/admin/edit-player-stats', {
            headers: {
                Authorization: `Bearer ${idToken}`
            },
            body: {
                players: players
            }
        });
    } catch (error) {
        console.error('Error uploading matchups:', error);
    }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setWarning('Please choose a file.');
            return; 
        }
        setWarning('');
        if (file) {
            var newPlayers = [];
            Papa.parse(file, {
                beforeFirstChunk: function(chunk) {
                    var rows = chunk.split(/\r\n|\r|\n/);
                    var headers = rows[1];
                    rows.splice(0, 2);
                    return headers + '\n' + rows.join('\n');
                },
                complete: (result) => {
                    for (const row of result.data) {
                        var player = row['Player'];
                        player = findPlayerId(player);
                        if(player){
                            var rankPoints = row['Rank Points'];
                            var fileWins = row['File Wins'];
                            var playoffsBucks = row['Playoffs Bucks'];
                            var totalDollarPayout = row['Total Fictional-Dollar Payout'];
                            if (player !== "") {
                                var newRow = [];
                                newRow.push(player);
                                newRow.push(rankPoints);
                                newRow.push(fileWins);
                                newRow.push(playoffsBucks);
                                newRow.push(totalDollarPayout);
                                newPlayers.push(newRow);
                            }
                        }
                    }
                    sendToServer(newPlayers);
                },
                header: true,
                skipEmptyLines: true,
            });
        }
        
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const fetchGoogleSheetData = async () => {
        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();
        const response = await API.get('ssAdmin', '/admin/update-leaderboard', {
            headers: {
                Authorization: `Bearer ${idToken}`
            }
        });
        
        var newPlayers = [];
        for(let item of response){
            if(item[0]===""||item[0]==="Player"){
                continue;
            }
            let player = findPlayerId(item[0]);
            item[0]=player;
            if(player){
                newPlayers.push(item);
            }
        }
        console.log(newPlayers);
        sendToServer(newPlayers);
    };

    return (
        <div>
            <h2>Update Season Point Totals</h2>
            <form onSubmit={handleSubmit}>

                <div>
                    <label htmlFor="fileInput">Season LeaderBoard:</label>
                    <input type="file" id="fileInput" onChange={handleFileChange} />
                </div>
                
                <p className='warning'>{warning}</p>

                <div>
                    <button type="submit">Update with file</button>
                </div>
            </form>
            <div>
                <button onClick={fetchGoogleSheetData}>Update with google API</button>
            </div>
        </div>
    )
}
