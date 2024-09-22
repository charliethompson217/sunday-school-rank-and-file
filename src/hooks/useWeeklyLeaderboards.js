import { useState, useEffect } from 'react';
import { API } from 'aws-amplify';

export const useWeeklyLeaderboards = () => {
    const [fetchedWeeklyLeaderboards, setFetchedWeeklyLeaderboards] = useState([]);

    useEffect(() => {
        const fetchWeeklyLeaderboards = async () => {
            try {
                const Fetched_Weekly_Leaderboards = await API.get('playerApi', '/player/get-weekly-Leaderboards');
                setFetchedWeeklyLeaderboards(Fetched_Weekly_Leaderboards);
            } catch (error) {
                console.log(error);
            }
        };
        fetchWeeklyLeaderboards();
    }, []);

    return fetchedWeeklyLeaderboards;
};
