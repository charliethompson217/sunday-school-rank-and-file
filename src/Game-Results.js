import React, { useState, useEffect } from 'react';
import { API, Amplify, Auth } from 'aws-amplify';
import awsExports from './aws-exports';
import './App.css';
import QuestionWithTwoButtons from './QuestionWithTwoButtons';


const LivePicks = () => {
    const [rankPicks, setRankPicks] = useState([]);
    const [rankMatchups, setRankMatchups] = useState([]);
    const [filePicks, setFilePicks] = useState([]);
    const [fileMatchups, setFileMatchups] = useState([]);

    useEffect( () => {
        const fetchPlayers = async () => {
            const fetchedMatchupsResponse = await API.get('sundaySchoolConfiguration', '/configuration/get-matchups');
            const { rankMatchups: fetchedRankMatchups, fileMatchups: fetchedFileMatchups} = fetchedMatchupsResponse;
            setRankMatchups(fetchedRankMatchups);
            setFileMatchups(fetchedFileMatchups);
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
        fetchPlayers();
    }, []);

    const combinedMatchups = [...rankMatchups, ...fileMatchups];
    const halfwayPoint = Math.ceil(combinedMatchups.length / 2);
    const firstColumnMatchups = combinedMatchups.slice(0, halfwayPoint);
    const secondColumnMatchups = combinedMatchups.slice(halfwayPoint);

    return (
        <div className="matchups-container">
            <div className='Admin' >
                <button>Update With Google API</button>
            </div>
            <div className="matchup-column">
                {firstColumnMatchups.map((data, index) => (
                    <QuestionWithTwoButtons
                        key={`first-${index}`}
                        question={`${data[0]} @ ${data[1]}`}
                        label1={data[0]}
                        label2={data[1]}
                        description={data[2]}
                        answer={rankPicks[index]?.value || filePicks[index - rankMatchups.length]?.value}
                    />
                ))}
            </div>
            <div className="matchup-column">
                {secondColumnMatchups.map((data, index) => (
                    <QuestionWithTwoButtons
                        key={`second-${index + halfwayPoint}`}
                        question={`${data[0]} @ ${data[1]}`}
                        label1={data[0]}
                        label2={data[1]}
                        description={data[2]}
                        answer={rankPicks[index + halfwayPoint]?.value || filePicks[index - rankMatchups.length + halfwayPoint]?.value}
                    />
                ))}
            </div>
        </div>
    );
};

export default LivePicks;
