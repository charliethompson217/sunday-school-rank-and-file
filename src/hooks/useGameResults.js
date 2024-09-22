import { useState, useEffect } from 'react';
import { API } from 'aws-amplify';

export const useGameResults = () => {
    const [fetchedGameResults, setFetchedGameResults] = useState({});

    useEffect(() => {
        const fetchGameResults = async () => {
            try {
                const Fetched_GameResults = await API.get('sundaySchoolConfiguration', '/configuration/get-game-results');
                setFetchedGameResults(Fetched_GameResults);
            } catch (error) {
                console.log(error);
            }
        };
        fetchGameResults();
    }, []);

    return fetchedGameResults;
};
