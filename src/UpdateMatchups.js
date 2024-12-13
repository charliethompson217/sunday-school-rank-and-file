import React, { useState } from 'react';
import { API, Amplify, Auth } from 'aws-amplify';
import Papa from 'papaparse';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

export default function UpdateMatchups() {
    const [file, setFile] = useState(null);
    const [week, setWeek] = useState('Choose week');
    const [curWeek, setCurWeek] = useState('Choose week');
    const [dateTime, setDateTime] = useState('');
    const [status, setStatus] = useState('');
    const [status2, setStatus2] = useState('');
    const [warning, setWarning] = useState('');
    const weekOptions = [
        'Choose week', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16', 'Week 17', 'Week 18', 'Wild Card Round', 'Divisional Round', 'Conference Round', 'Super Bowl', 'Post-Season'
    ];

    const sendToServer = async (payload) => {
        try {
            const session = await Auth.currentSession();
            const idToken = session.getIdToken().getJwtToken();
            await API.post('ssAdmin', '/admin/upload-matchups', {
                headers: {
                    Authorization: `Bearer ${idToken}`
                },
                body: {
                    ClientId: 'matchups',
                    week: week,
                    closeTime: new Date(dateTime).toISOString(),
                    data: payload,
                }
            });
            setStatus(`${week} 'Matchups Updated Succesfuly!`);
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
        if (!dateTime) {
            setWarning('Please select a date and time.');
            return;
        }
        if (week === 'Choose week') {
            setWarning('Please select a week.');
            return;
        }
        setWarning('');

        try {
            const payload = await parseFile(file, week);
            await sendToServer(payload);
            setStatus(`${week} Matchups Updated Successfully!`);
        } catch (error) {
            console.error('Error parsing file:', error);
            setWarning('Failed to parse the file. Please check the file format.');
        }
    };

    const parseFile = (file, week) => {
        return new Promise((resolve, reject) => {
            let rankMatchups = [];
            let fileMatchups = [];
    
            Papa.parse(file, {
                complete: (result) => {
                    try {
                        const weekNumber = week ? parseInt(week.split(' ')[1]) : NaN;
                        if (!isNaN(weekNumber)) {
                            for (const row of result.data) {
                                let type = row['Type'];
                                let newRow = [];
                                if (type === 'Rank') {
                                    newRow.push(row['Away']);
                                    newRow.push(row['Home']);
                                    newRow.push(row['Description']);
                                    rankMatchups.push(newRow);
                                }
                                if (type === 'File' || type === 'Christmas File' || type === 'Thanksgiving File') {
                                    newRow.push(row['Away']);
                                    newRow.push(row['Home']);
                                    newRow.push(row['Description']);
                                    fileMatchups.push(newRow);
                                }
                            }
        
                            const payload = {
                                rankMatchups,
                                fileMatchups,
                            };
        
                            resolve(payload);
                        } else { 
                            // Parse Playoffs Matchup File
                        }
                    } catch (error) {
                        reject(error);
                    }
                },
                header: true,
                error: (error) => {
                    reject(error);
                },
            });
        });
    };
    

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setStatus('');
    };

    const handleCurWeekSubmit = async (e) => {
        e.preventDefault();
        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();
        await API.post('ssAdmin', '/admin/set-cur-week', {
            headers: {
                Authorization: `Bearer ${idToken}`
            },
            body: {
                ClientId: 'cur-week',
                week: curWeek,
            }
        });
        setStatus2('Current Week Updated Succesfuly!');
    };

    return (
        <div>
            <h2>Current Week</h2>
            <form onSubmit={handleCurWeekSubmit}>
                <div>
                    <label htmlFor="Current-weekSelect">Current Week:</label>
                    <select id="Current-weekSelect" value={curWeek} onChange={(e) => setCurWeek(e.target.value)}>
                        {weekOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <p>{status2}</p>
                <div>
                    <button type="submit">Update Current Week</button>
                </div>
            </form>
            <h2>Matchups</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="fileInput">Matchups:</label>
                    <input type="file" id="fileInput" onChange={handleFileChange} />
                </div>
                <div>
                    <label htmlFor="dateTimeInput">Close Form On: </label>
                    <input
                        type="datetime-local"
                        id="dateTimeInput"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                    />
                    <label htmlFor="dateTimeInput"> EST</label>
                </div>
                <div>
                    <label htmlFor="Matchup-weekSelect">For Week:</label>
                    <select id="Matchup-weekSelect" value={week} onChange={(e) => setWeek(e.target.value)}>
                        {weekOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <p className='warning'>{warning}</p>
                <p>{status}</p>
                <div>
                    <button type="submit">Update Form</button>
                </div>
            </form>
        </div>
    );
};