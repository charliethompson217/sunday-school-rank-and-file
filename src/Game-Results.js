import React, { useState, useEffect, useContext } from 'react';
import { API, Auth } from 'aws-amplify';
import QuestionWithThreeButtons from './QuestionWithThreeButtons';
import { DataContext } from './DataContext';

export default function LivePicks() {
    const { fetchedCurWeek, fetchedGameResults, fetchedPreviousMatchupsResponse, fetchedMatchupsResponse } = useContext(DataContext);
    const [rankPicks, setRankPicks] = useState([]);
    const [rankMatchups, setRankMatchups] = useState([]);
    const [filePicks, setFilePicks] = useState([]);
    const [fileMatchups, setFileMatchups] = useState([]);
    const [week, setWeek] = useState('Choose week');
    const [hasSubmit, setHasSubmit] = useState(false);
    const [isPlayoffs, setIsPlayoffs] = useState(false);
    const [playoffsMatchups, setPlayoffsMatchups] = useState([]);
    const [playoffsPicks, setPlayoffsPicks] = useState([]);

    const weekOptions = [
        'Choose week', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16', 'Week 17', 'Week 18', 'Wild Card Round', 'Divisional Round', 'Conference Round', 'Super Bowl'
    ];

    function decrementLastNumber(week) {
        const weekNumber = week ? parseInt(week.split(' ')[1]) : NaN;
        if (!isNaN(weekNumber)) {
            return week?.replace(/\d+$/, (num) => parseInt(num, 10) - 1) || 'Choose week';
        } else if (week === 'Wild Card Round'){
            return 'Week 18';
        } else if (week === 'Divisional Round'){
            return 'Wild Card Round';
        } else if (week === 'Conference Round'){
            return 'Divisional Round';
        } else if (week === 'Super Bowl'){
            return 'Conference Round';
        } else if (week === 'Post-Season'){
            return 'Super Bowl';
        }
    };

    useEffect(() => {
        const setData = async () => {
            setRankMatchups([]);
            setFileMatchups([]);
            setRankPicks([]);
            setFilePicks([]);
            setIsPlayoffs(false);
            setPlayoffsMatchups([]);
            setPlayoffsPicks([]);
            setHasSubmit(false);
            let curWeek = decrementLastNumber(fetchedCurWeek);
            if (week !== "Choose week") {
                curWeek = week;
            }
            else {
                setWeek(curWeek);
            }
            const weekNumber = curWeek ? parseInt(curWeek.split(' ')[1]) : NaN;
            try {
                let matchupsResponse = [];
                if (curWeek === decrementLastNumber(fetchedCurWeek)) {
                    matchupsResponse = fetchedPreviousMatchupsResponse;
                }
                else if (curWeek === fetchedCurWeek) {
                    matchupsResponse = fetchedMatchupsResponse;
                }
                else {
                    matchupsResponse = await API.put('sundaySchoolConfiguration', '/configuration/matchups', {
                        body: {
                            week: `${curWeek}`,
                        },
                    });
                }
                if (!isNaN(weekNumber)) {
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
                } else {
                    setIsPlayoffs(true);
                    if(matchupsResponse?.matchups){
                        setPlayoffsMatchups(matchupsResponse.matchups);
                    }
                    if(fetchedGameResults[curWeek]?.playoffsResults?.length > 0){
                        setPlayoffsPicks(fetchedGameResults[curWeek].playoffsResults);
                    } else {
                        const initialPlayoffsPicks = matchupsResponse?.matchups?.map((matchup) => ({
                            game: matchup,
                            value: null,
                        })) || [];
                        setPlayoffsPicks(initialPlayoffsPicks);
                    }
                }
            } catch (error) {
                console.error(error);
            }
            
            
        };

        if (fetchedGameResults && fetchedCurWeek && fetchedMatchupsResponse && fetchedPreviousMatchupsResponse) {
            setData();
        }
    }, [week, fetchedCurWeek, fetchedGameResults, fetchedMatchupsResponse, fetchedPreviousMatchupsResponse]);

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

    const onPlayoffsPickChange = (index, value) => {
        setPlayoffsPicks((prevPlayoffsPicks) =>
            prevPlayoffsPicks.map((pick, i) =>
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
                    playoffsResults: playoffsPicks,
                }
            });
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
    }, [week]);

    if (hasSubmit) {
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
        );
    } else if (isPlayoffs) {
        return (
            <div className="Admin">
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
                </div>
                <div className='Result-Games'>
                    {playoffsMatchups?.length > 0 && playoffsMatchups.map((data, index) => (
                        <QuestionWithThreeButtons
                            key={index}
                            label1={data.Home}
                            label2={data.Away}
                            answer={playoffsPicks?.[index]?.value}
                            onInputChange={(value) => onPlayoffsPickChange(index, value)}
                        />
                    ))}
                </div>
            </div>
        )
    } else {
        return (
            <div className="Admin">
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
                </div>
                <div className='Result-Games'>
                    {rankMatchups?.length > 0 && rankMatchups.map((data, index) => (
                        <QuestionWithThreeButtons
                            key={`rank-${index}`}
                            label1={data[0]}
                            label2={data[1]}
                            description={data[2]}
                            answer={rankPicks[index]?.value}
                            onInputChange={(value) => onRankPicksChange(index, value)}
                        />
                    ))}
                    {fileMatchups?.length > 0 && fileMatchups.map((data, index) => (
                        <QuestionWithThreeButtons
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
    }
};