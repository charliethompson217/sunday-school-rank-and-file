import React, { useState, useEffect, useContext } from 'react';
import { DataContext } from './DataContext';
import RegularSeasonFormContainer from './RegularSeasonFormContainer';
import PlayoffsFormContainer from './PlayoffsFormContainer';

export default function PickFormDecider({user}) {
    const { fetchedCurWeek } = useContext(DataContext);
    const [week, setWeek] = useState(fetchedCurWeek);

    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
      setWeek(fetchedCurWeek);
    }, [fetchedCurWeek]);

    const weekNumber = week ? parseInt(week.split(' ')[1]) : NaN;

    if (!isNaN(weekNumber)) {
        return (
            <RegularSeasonFormContainer />
        );
    } else {
        return (
            <PlayoffsFormContainer user={user}/>
        );
    } 
}
