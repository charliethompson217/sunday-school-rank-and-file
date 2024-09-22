import React, { createContext } from 'react';
import { useCurrentWeek } from './hooks/useCurrentWeek';
import { usePlayers } from './hooks/usePlayers';
import { useSubmissions } from './hooks/useSubmissions';
import { useGameResults } from './hooks/useGameResults';
import { useMatchups } from './hooks/useMatchups';
import { useUserPicks } from './hooks/useUserPicks';
import { useWeeklyLeaderboards } from './hooks/useWeeklyLeaderboards';

// Create a Data Context
export const DataContext = createContext();

// Provider Component
export const DataProvider = ({ user, children }) => {
    const fetchedCurWeek = useCurrentWeek();
    const fetchedPlayers = usePlayers();
    const fetchedSubmissions = useSubmissions();
    const fetchedGameResults = useGameResults();
    const fetchedMatchupsResponse = useMatchups(fetchedCurWeek);
    const { fetchedCurPicks, fetchedRankPicks, fetchedRankedRanks, fetchedFilePicks, setNewPicks } = useUserPicks(user, fetchedCurWeek);
    const fetchedWeeklyLeaderboards = useWeeklyLeaderboards();

    return (
        <DataContext.Provider value={{
            fetchedCurWeek,
            fetchedPlayers,
            fetchedSubmissions,
            fetchedGameResults,
            fetchedMatchupsResponse,
            fetchedCurPicks,
            fetchedRankPicks,
            fetchedRankedRanks,
            fetchedFilePicks,
            setNewPicks,
            fetchedWeeklyLeaderboards,
        }}>
            {children}
        </DataContext.Provider>
    );
};
