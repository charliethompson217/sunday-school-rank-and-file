import React, { createContext, useState, useEffect } from 'react';
import { API, Auth } from 'aws-amplify';

// Create a Data Context
export const DataContext = createContext();

// Provider Component
export const DataProvider = ({ user, children }) => {
    const [fetchedCurWeek, setFetchedCurWeek] = useState('');
    const [fetchedPlayers, setFetchedPlayers] = useState([]);
    const [fetchedSubmissions, setFetchedSubmissions] = useState([]);
    const [fetchedGameResults, setFetchedGameResults] = useState({});
    const [fetchedMatchupsResponse, setFetchedMatchupsResponse] = useState('');
    const [fetchedCurPicks, setFetchedCurPicks] = useState({});
    const [fetchedRankPicks, setFetchedRankPicks] = useState([]);
    const [fetchedRankedRanks, setFetchedRankedRanks] = useState([]);
    const [fetchedFilePicks, setFetchedFilePicks] = useState([]);

    // Fetch data from the server
    useEffect(() => {
        const fetchData = async () => {
            try {
                const Fetched_Players = await API.get('playerApi', '/player/get-players');
                setFetchedPlayers(Fetched_Players);
            } catch (error) {
                console.log(error);
            }

            try {
                const Fetched_Submissions = await API.get('sundaySchoolSubmissions', '/submission/get-submissions');
                setFetchedSubmissions(Fetched_Submissions);
            } catch (error) {
                console.log(error);
            }

            try {
                const Fetched_GameResults = await API.get('sundaySchoolConfiguration', '/configuration/get-game-results');
                setFetchedGameResults(Fetched_GameResults);
            } catch (error) {
                console.log(error);
            }

            try {
                const Fetched_Cur_Week = await API.get('sundaySchoolConfiguration', '/configuration/get-current-week');
                setFetchedCurWeek(Fetched_Cur_Week);
                const Fetched_Matchups_Response = await API.put('sundaySchoolConfiguration', '/configuration/matchups', {
                    body: {
                        week: `${Fetched_Cur_Week}`,
                    },
                });
                setFetchedMatchupsResponse(Fetched_Matchups_Response);
            } catch (error) {
                console.log(error);
            }
        };

        const fetchUserData = async () => {
            try {
                const Fetched_Cur_Week = await API.get('sundaySchoolConfiguration', '/configuration/get-current-week');
                const session = await Auth.currentSession();
                const idToken = session.getIdToken().getJwtToken();
                const Fetched_Cur_Picks = await API.put('sundaySchoolSubmissions', '/submission/get-picks-for-player', {
                    body: {
                        jwt_token: `${idToken}`,
                        week: Fetched_Cur_Week,
                    },
                });
                setFetchedCurPicks(Fetched_Cur_Picks);

                const fetchedRankPicks = parseJsonString(Fetched_Cur_Picks.rankPicks);
                const fetchedRankedRanks = parseJsonString(Fetched_Cur_Picks.rankedRanks);
                const fetchedFilePicks = parseJsonString(Fetched_Cur_Picks.filePicks);

                setFetchedRankPicks(fetchedRankPicks);
                setFetchedRankedRanks(fetchedRankedRanks);
                setFetchedFilePicks(fetchedFilePicks);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
        if (user) {
            fetchUserData();
        }
    }, [user]);

    // Set new picks
    const setNewPicks = (newRankedPicks, newRankedRanks, newFilePicks, newConfigId) => {
        setFetchedRankPicks(newRankedPicks);
        setFetchedRankedRanks(newRankedRanks);
        setFetchedFilePicks(newFilePicks);

        setFetchedCurPicks(prevCurPicks => ({
            ...prevCurPicks,
            configId: newConfigId,
            rankPicks: newRankedPicks,
            rankedRanks: newRankedRanks,
            filePicks: newFilePicks,
        }));
    };

    // Set new game results immutably
    const setNewGameResults = (week, rankPicks, filePicks) => {
        setFetchedGameResults(prevFetchedGameResults => ({
            ...prevFetchedGameResults,
            [week]: {
                ...prevFetchedGameResults[week],
                rankPicks: rankPicks,
                filePicks: filePicks,
            },
        }));
    };

    // Helper function to parse JSON safely
    const parseJsonString = (jsonString) => {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return null;
        }
    };

    return (
        <DataContext.Provider value={{
            fetchedCurWeek,
            fetchedPlayers,
            fetchedSubmissions,
            fetchedGameResults,
            fetchedMatchupsResponse,
            fetchedCurPicks,
            setNewPicks,
            fetchedRankPicks,
            fetchedRankedRanks,
            fetchedFilePicks,
            setNewGameResults,
        }}>
            {children}
        </DataContext.Provider>
    );
};
