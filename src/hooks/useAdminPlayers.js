import { useState, useEffect } from 'react';
import { API, Auth } from 'aws-amplify';
import jwtDecode from 'jwt-decode';

export const useAdminPlayers = (user) => {
    const [fetchedAdminPlayers, setFetchedAdminPlayers] = useState([]);

    useEffect(() => {
        const fetchPlayers = async () => {
            const session = await Auth.currentSession();
            const idToken = session.getIdToken().getJwtToken();
            const decodedToken = jwtDecode(idToken);
            if (decodedToken['cognito:groups'] && decodedToken['cognito:groups'].includes('Admin')) {
                try {
                    const Fetched_Admin_Players = await API.get('ssAdmin', '/admin/get-players',{
                    headers: {
                        Authorization: `Bearer ${idToken}`
                    },
                    });
                    setFetchedAdminPlayers(Fetched_Admin_Players);
                } catch (error) {
                    console.log(error);
                }
            }
        };
        if(user){
            fetchPlayers();
        }
    }, [user]);

    return fetchedAdminPlayers;
};
