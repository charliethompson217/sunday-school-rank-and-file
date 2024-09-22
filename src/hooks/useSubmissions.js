import { useState, useEffect } from 'react';
import { API } from 'aws-amplify';

export const useSubmissions = () => {
    const [fetchedSubmissions, setFetchedSubmissions] = useState([]);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const Fetched_Submissions = await API.get('sundaySchoolSubmissions', '/submission/get-submissions');
                setFetchedSubmissions(Fetched_Submissions);
            } catch (error) {
                console.log(error);
            }
        };
        fetchSubmissions();
    }, []);

    return fetchedSubmissions;
};
