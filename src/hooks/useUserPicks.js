import { useState, useEffect } from 'react';
import { API, Auth } from 'aws-amplify';

export const useUserPicks = (user, fetchedCurWeek) => {
    const [fetchedCurPicks, setFetchedCurPicks] = useState({});
    const [fetchedRankPicks, setFetchedRankPicks] = useState([]);
    const [fetchedRankedRanks, setFetchedRankedRanks] = useState([]);
    const [fetchedFilePicks, setFetchedFilePicks] = useState([]);
    const [fetchedPlayoffsPicks, setFetchedPlayoffsPicks] = useState({});

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const session = await Auth.currentSession();
                const idToken = session.getIdToken().getJwtToken();
                const Fetched_Cur_Picks = await API.put('authorizedPlayerAPI', '/player/get-picks-for-player', {
                    headers: {
                        Authorization: `Bearer ${idToken}`
                    },
                    body: {
                        operation: 'get-picks-for-player',
                        week: fetchedCurWeek,
                    },
                });
                setFetchedCurPicks(Fetched_Cur_Picks);
                if(Fetched_Cur_Picks.rankPicks && Fetched_Cur_Picks.rankedRanks && Fetched_Cur_Picks.filePicks){
                    const fetchedRankPicks = parseJsonString(Fetched_Cur_Picks.rankPicks);
                    const fetchedRankedRanks = parseJsonString(Fetched_Cur_Picks.rankedRanks);
                    const fetchedFilePicks = parseJsonString(Fetched_Cur_Picks.filePicks);
                    setFetchedRankPicks(fetchedRankPicks);
                    setFetchedRankedRanks(fetchedRankedRanks);
                    setFetchedFilePicks(fetchedFilePicks);
                } else {
                    setFetchedPlayoffsPicks(parseJsonString(Fetched_Cur_Picks.picks));
                }
                
            } catch (error) {
                console.error(error);
            }
        };

        if (user && fetchedCurWeek) fetchUserData();
    }, [user, fetchedCurWeek]);

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

    const setNewPlayoffsPicks = (newPlayoffsPicks, newConfigId ) => { 
        setFetchedPlayoffsPicks(newPlayoffsPicks)
        setFetchedCurPicks(prevCurPicks => ({
            ...prevCurPicks,
            configId: newConfigId,
            playoffsPicks: newPlayoffsPicks
        }));
    }

    return {
        fetchedCurPicks,
        fetchedRankPicks,
        fetchedRankedRanks,
        fetchedFilePicks,
        setNewPicks,
        fetchedPlayoffsPicks,
        setNewPlayoffsPicks,
    };
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
