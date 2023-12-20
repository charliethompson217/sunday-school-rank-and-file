import React, { useState, useEffect } from 'react';
import { API, Auth } from 'aws-amplify';
import './App.css';
import QuestionWithTwoButtons from './QuestionWithTwoButtons';

const LivePicks = () => {
    const [rankPicks, setRankPicks] = useState([]);
    const [rankMatchups, setRankMatchups] = useState([]);
    const [filePicks, setFilePicks] = useState([]);
    const [fileMatchups, setFileMatchups] = useState([]);
    const [week, setWeek] = useState('Choose week');
    const weekOptions = [
        'Choose week', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10','Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16', 'Week 17', 'Week 18'
    ];
    useEffect(() => {
        const fetchMatchups = async () => {
            
            let curWeek = await API.get('sundaySchoolConfiguration', '/configuration/get-current-week');
            if(week!=="Choose week"){
                curWeek = week;
            }
            else{
                setWeek(curWeek);
            }
            const fetchedMatchupsResponse = await API.put('sundaySchoolConfiguration', '/configuration/matchups',{
                body: {
                    week: `${curWeek}`,
                },
            });
            const { rankMatchups: fetchedRankMatchups, fileMatchups: fetchedFileMatchups, week: fetchedWeek } = fetchedMatchupsResponse;
            setRankMatchups(fetchedRankMatchups);
            setFileMatchups(fetchedFileMatchups);
            try {
                const fetchedGameResults = await API.put('sundaySchoolConfiguration', '/configuration/game-results',{
                    body: {
                        week: `${curWeek}`,
                    },
                });
                const {rankResults: fetchedRankResults, fileResults: fetchedFileResults, week: fetchedResultsWeek} = fetchedGameResults
                if(fetchedRankResults!==null&&fetchedFileResults!==null && fetchedResultsWeek === fetchedWeek){
                    setRankPicks(fetchedRankResults);
                    setFilePicks(fetchedFileResults);
                }
                else {
                    const initialRankPicks = fetchedRankMatchups.map((matchup) => ({
                        game: matchup,
                        value: null,
                    }));
                    setRankPicks(initialRankPicks);
        
                    const initialFilePicks = fetchedFileMatchups.map((matchup) => ({
                        game: matchup,
                        value: null,
                    }));
                    setFilePicks(initialFilePicks);
                }
            } catch (error){
                const initialRankPicks = fetchedRankMatchups.map((matchup) => ({
                    game: matchup,
                    value: null,
                }));
                setRankPicks(initialRankPicks);
    
                const initialFilePicks = fetchedFileMatchups.map((matchup) => ({
                    game: matchup,
                    value: null,
                }));
                setFilePicks(initialFilePicks);
            }
            
        }
        fetchMatchups();
    }, [week]);

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
        } catch (error) {
          console.error('Error submitting picks:', error);
        }
      }

    return (
        <div className="matchups-container">
            <div className='Admin'>
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
            
            <div className="matchup-column">
                {rankMatchups.map((data, index) => (
                    <QuestionWithTwoButtons
                        key={`rank-${index}`}
                        question={`${data[0]} @ ${data[1]}`}
                        label1={data[0]}
                        label2={data[1]}
                        description={data[2]}
                        answer={rankPicks[index]?.value}
                        onInputChange={(value) => onRankPicksChange(index, value)}
                    />
                ))}
            </div>
            <div className="matchup-column">
                {fileMatchups.map((data, index) => (
                    <QuestionWithTwoButtons
                        key={`file-${index}`}
                        question={`${data[0]} @ ${data[1]}`}
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
