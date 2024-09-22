import { useState, useEffect } from 'react';
import { API } from 'aws-amplify';

export const useCurrentWeek = () => {
    const [fetchedCurWeek, setFetchedCurWeek] = useState('');

    useEffect(() => {
        const fetchCurrentWeek = async () => {
            try {
                const Fetched_Cur_Week = await API.get('sundaySchoolConfiguration', '/configuration/get-current-week');
                setFetchedCurWeek(Fetched_Cur_Week);
            } catch (error) {
                console.log(error);
            }
        };
        fetchCurrentWeek();
    }, []);

    return fetchedCurWeek;
};
