import { useState, useEffect } from 'react';
import { API } from 'aws-amplify';

export const usePreviousMatchups = (fetchedCurWeek) => {
    const [fetchedPreviousMatchupsResponse, setFetchedMatchupsResponse] = useState('');
    function decrementLastNumber(str) {
        return str.replace(/\d+$/, (num) => parseInt(num, 10) - 1);
    }
    useEffect(() => {
        const fetchMatchups = async () => {
            try {
                const Fetched_Previous_Matchups_Response = await API.put('sundaySchoolConfiguration', '/configuration/matchups', {
                    body: {
                        week: `${decrementLastNumber(fetchedCurWeek)}`,
                    },
                });
                setFetchedMatchupsResponse(Fetched_Previous_Matchups_Response);
            } catch (error) {
                console.log(error);
            }
        };
        if (fetchedCurWeek) fetchMatchups();
    }, [fetchedCurWeek]);

    return fetchedPreviousMatchupsResponse;
};
