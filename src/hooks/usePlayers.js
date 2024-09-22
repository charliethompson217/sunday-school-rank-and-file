import { useState, useEffect } from 'react';
import { API } from 'aws-amplify';

export const usePlayers = () => {
    const [fetchedPlayers, setFetchedPlayers] = useState([]);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const Fetched_Players = await API.get('playerApi', '/player/get-players');
                setFetchedPlayers(Fetched_Players);
            } catch (error) {
                console.log(error);
            }
        };
        fetchPlayers();
    }, []);

    return fetchedPlayers;
};
