import React, { useState } from 'react';
import { API, Amplify, Auth } from 'aws-amplify';
import Papa from 'papaparse';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

export default function Configuration() {
    const [file, setFile] = useState(null);
    const [week, setWeek] = useState('Choose week');
    const [dateTime, setDateTime] = useState('');
    const [status, setStatus] = useState('');
    const [warning, setWarning] = useState('');
    const weekOptions = [
        'Choose week', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10','Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16', 'Week 17', 'Week 18'
    ];

    const sendToServer = async (rankMatchups, fileMatchups) => {
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
                rankMatchups: rankMatchups,
                fileMatchups: fileMatchups,
            }
        });
        setStatus('Configuration Updated Succesfuly!');
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
        if (week==='Choose week') {
            setWarning('Please select a week.');
            return; 
        }
        setWarning('');
        if (file) {
            var rankMatchups = [];
            var fileMatchups = [];
            Papa.parse(file, {
                complete: (result) => {
                    for (const row of result.data) {
                        var type = row['Type'];
                        var newRow = [];
                        if(type==='Rank'){
                            newRow.push(row['Away']);
                            newRow.push(row['Home']);
                            newRow.push(row['Description']);
                            rankMatchups.push(newRow);
                        }
                        if(type==='File'||type==='Christmas File'||type==='Thanksgiving File'){
                            newRow.push(row['Away']);
                            newRow.push(row['Home']);
                            newRow.push(row['Description']);
                            fileMatchups.push(newRow);
                        }
                    }
                    sendToServer(rankMatchups, fileMatchups);
                },
                header: true,
            });
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };
    return (
        <div>
            <h2>Update Website Configuration</h2>
                <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="fileInput">Choose a File:</label>
                    <input type="file" id="fileInput" onChange={handleFileChange} />
                </div>
                <div>
                    <label htmlFor="dateTimeInput">Close form on / Home-Screen Time: </label>
                    <input
                        type="datetime-local"
                        id="dateTimeInput"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                    />
                    <label htmlFor="dateTimeInput"> EST</label>
                </div>
                <div>
                    <label htmlFor="weekSelect">Select Week:</label>
                    <select id="weekSelect" value={week} onChange={(e) => setWeek(e.target.value)}>
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
    )
}
