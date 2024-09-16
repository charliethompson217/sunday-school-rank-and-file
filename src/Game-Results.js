import React, { useState, useEffect, useContext } from 'react';
import { API, Auth } from 'aws-amplify';
import './App.css';
import QuestionWithTwoButtons from './QuestionWithTwoButtons';
import { DataContext } from './DataContext';

const LivePicks = () => {
    const { fetchedCurWeek, fetchedGameResults, setNewGameResults } = useContext(DataContext);
    const [rankPicks, setRankPicks] = useState([]);
    const [rankMatchups, setRankMatchups] = useState([]);
    const [filePicks, setFilePicks] = useState([]);
    const [fileMatchups, setFileMatchups] = useState([]);
    const [week, setWeek] = useState('Choose week');
    const [hasSubmit, setHasSubmit] = useState(false);
    const weekOptions = [
        'Choose week', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16', 'Week 17', 'Week 18'
    ];

    function decrementLastNumber(str) {
        return str.replace(/\d+$/, (num) => parseInt(num, 10) - 1);
    }

    useEffect(() => {
        const setData = async () => {
            let curWeek = decrementLastNumber(fetchedCurWeek);
            if(week !== "Choose week"){
                curWeek = week;
            }
            else{
                setWeek(curWeek);
            }
    
            if (!fetchedGameResults) {
                console.warn('fetchedGameResults is undefined or null');
                return; 
            }
            try {
                const matchupsResponse = await API.put('sundaySchoolConfiguration', '/configuration/matchups',{
                    body: {
                        week: `${curWeek}`,
                    },
                });
                const { rankMatchups: fetchedRankMatchups = [], fileMatchups: fetchedFileMatchups = [] } = matchupsResponse || {};
        
                setRankMatchups(fetchedRankMatchups);
                setFileMatchups(fetchedFileMatchups);
            
                const { rankResults: fetchedRankResults, fileResults: fetchedFileResults } = fetchedGameResults[curWeek] || {};
        
                if (fetchedRankResults && fetchedFileResults) {
                    setRankPicks(fetchedRankResults);
                    setFilePicks(fetchedFileResults);
                } else if (fetchedRankMatchups && fetchedFileMatchups) {
                    const initialRankPicks = fetchedRankMatchups?.map((matchup) => ({
                        game: matchup,
                        value: null,
                    })) || [];
                    setRankPicks(initialRankPicks);
        
                    const initialFilePicks = fetchedFileMatchups?.map((matchup) => ({
                        game: matchup,
                        value: null,
                    })) || [];
                    setFilePicks(initialFilePicks);
                }
            } catch (error) {
                console.error(error);
            }
        };
    
        if (fetchedGameResults) {
            setData();
        } else {
            console.warn('fetchedGameResults is not available');
        }
    }, [week, fetchedCurWeek, fetchedGameResults]);

    const onRankPicksChange = (index, value) => {
        setRankPicks((prevRankPicks) =>
            prevRankPicks.map((pick, i) =>
                i === index ? { ...pick, value } : pick
            )
        );
    };
    const onFilePicksChange = (index, value) => {
        setFilePicks((prevFilePicks) =>
            prevFilePicks.map((pick, i) =>
                i === index ? { ...pick, value } : pick
            )
        );
    };
    const sendToServer = async () => {
        try {
            const session = await Auth.currentSession();
            const idToken = session.getIdToken().getJwtToken();
            await API.post('ssAdmin', '/admin/upload-game-results', {
                headers: {
                    Authorization: `Bearer ${idToken}`
                },
                body: {
                    week: week,
                    rankResults: rankPicks,
                    fileResults: filePicks,
                }
            });
            setNewGameResults(week, rankPicks, filePicks);
            setHasSubmit(true);
        } catch (error) {
            console.error('Error submitting game results:', error);
        }
    };

    const refresh = () => {
        setHasSubmit(false);
    };

    useEffect(() => {
        setHasSubmit(false);
    }, [ week]);

    if(hasSubmit){
        return (
            <div className="">
            <div className='Game-Results'>
                <h2>Game-Results</h2>
                <div>
                    <label htmlFor="weekSelect">For Week:</label>
                    <select id="weekSelect" value={week} onChange={(e) => setWeek(e.target.value)}>
                    {weekOptions.map((option) => (
                        <option key={option} value={option}>
                        {option}
                        </option>
                    ))}
                    </select>
                </div>
                <button onClick={refresh}>Succses &#x267A;</button>
            </div>
        </div>
        )
    }
    return (
        <div className="">
            <div className='Game-Results'>
                <h2>Game-Results</h2>
                <div>
                    <label htmlFor="weekSelect">For Week:</label>
                    <select id="weekSelect" value={week} onChange={(e) => setWeek(e.target.value)}>
                    {weekOptions.map((option) => (
                        <option key={option} value={option}>
                        {option}
                        </option>
                    ))}
                    </select>
                </div>
                <button onClick={sendToServer}>Update With Local Values</button>
                <button>Update With Google API (todo)</button>
            </div>
            <div className='Result-Games'>
                {rankMatchups?.length > 0 && rankMatchups.map((data, index) => (
                    <QuestionWithTwoButtons
                        key={`rank-${index}`}
                        label1={data[0]}
                        label2={data[1]}
                        description={data[2]}
                        answer={rankPicks[index]?.value}
                        onInputChange={(value) => onRankPicksChange(index, value)}
                    />
                ))}
                {fileMatchups?.length > 0 && fileMatchups.map((data, index) => (
                    <QuestionWithTwoButtons
                        key={`file-${index}`}
                        label1={data[0]}
                        label2={data[1]}
                        description={data[2]}
                        answer={filePicks[index]?.value}
                        onInputChange={(value) => onFilePicksChange(index, value)}
                    />
                ))}
            </div>
        </div>
    );
};

export default LivePicks;
