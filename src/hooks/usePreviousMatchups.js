import { useState, useEffect } from 'react';
import { API } from 'aws-amplify';

export const usePreviousMatchups = (fetchedCurWeek) => {
    const [fetchedPreviousMatchupsResponse, setFetchedMatchupsResponse] = useState('');
    function decrementLastNumber(week) {
        const weekNumber = week ? parseInt(week.split(' ')[1]) : NaN;
        if (!isNaN(weekNumber)) {
            return week?.replace(/\d+$/, (num) => parseInt(num, 10) - 1) || 'Choose week';
        } else if (week === 'Wild Card Round'){
            return 'Week 18';
        } else if (week === 'Divisional Round'){
            return 'Wild Card Round';
        } else if (week === 'Conference Round'){
            return 'Divisional Round';
        } else if (week === 'Super Bowl'){
            return 'Conference Round';
        } else if (week === 'Post-Season'){
            return 'Super Bowl';
        }
    };
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
