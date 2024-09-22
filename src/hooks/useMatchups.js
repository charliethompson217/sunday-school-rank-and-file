import { useState, useEffect } from 'react';
import { API } from 'aws-amplify';

export const useMatchups = (fetchedCurWeek) => {
    const [fetchedMatchupsResponse, setFetchedMatchupsResponse] = useState('');

    useEffect(() => {
        const fetchMatchups = async () => {
            try {
                const Fetched_Matchups_Response = await API.put('sundaySchoolConfiguration', '/configuration/matchups', {
                    body: {
                        week: `${fetchedCurWeek}`,
                    },
                });
                setFetchedMatchupsResponse(Fetched_Matchups_Response);
            } catch (error) {
                console.log(error);
            }
        };
        if (fetchedCurWeek) fetchMatchups();
    }, [fetchedCurWeek]);

    return fetchedMatchupsResponse;
};
