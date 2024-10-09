import React, { useState, useEffect, useContext } from 'react';
import { Line } from 'react-chartjs-2';
import { DataContext } from './DataContext';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const weekOptions = [
  'Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8',
  'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16', 'Week 17', 'Week 18'
];

export default function PlayerWeeklyStandingsgraph() {
  const { fetchedPlayers, fetchedWeeklyLeaderboards, fetchedCurWeek } = useContext(DataContext);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const generateDistinctColor = (index, totalPlayers) => {
    const hue = (index / totalPlayers) * 300;
    return `hsl(${hue}, 100%, 50%)`;
  };

  const calculateRanksForWeek = (leaderboard, players) => {
    const cumulativePointsMap = new Map();
    leaderboard?.data.forEach(p => {
      const playerId = p[0];
      const rankPoints = parseFloat(p[1]);
      if (!isNaN(rankPoints)) {
        if (!cumulativePointsMap.has(playerId)) {
          cumulativePointsMap.set(playerId, 0);
        }
        cumulativePointsMap.set(playerId, cumulativePointsMap.get(playerId) + rankPoints);
      }
    });

    const sortedByPoints = [...cumulativePointsMap.entries()].sort((a, b) => b[1] - a[1]);
    const ranks = new Map();
    let currentRank = 1;
    let lastPoints = null;
    let playersWithSameRank = 0;
    sortedByPoints.forEach(([playerId, points]) => {
      if (points === lastPoints) {
        playersWithSameRank++;
      } else {
        currentRank += playersWithSameRank;
        playersWithSameRank = 1;
      }

      ranks.set(playerId, currentRank);
      lastPoints = points;
    });

    return ranks;
  };

  useEffect(() => {
    if (!fetchedPlayers || !fetchedWeeklyLeaderboards || !fetchedCurWeek) return;

    const currentWeekIndex = weekOptions.indexOf(fetchedCurWeek) - 1;

    if (currentWeekIndex < 0) return;

    const currentWeekLeaderboard = fetchedWeeklyLeaderboards.find(w => w.Week === weekOptions[currentWeekIndex]);
    const currentWeekRanks = calculateRanksForWeek(currentWeekLeaderboard, fetchedPlayers);
    const playersWithCurrentRank = fetchedPlayers
      .filter(player => player.RankPoints !== null && player.RankPoints !== undefined)
      .map(player => {
        const currentRank = currentWeekRanks.get(player.playerId) || fetchedPlayers.length;
        return { ...player, currentRank };
      });

    const sortedPlayersByFinalRank = playersWithCurrentRank.sort((a, b) => a.RankPoints - b.RankPoints).reverse();
    const filteredWeeks = weekOptions.slice(0, currentWeekIndex + 1);
    const dataForChart = {
      labels: filteredWeeks,
      datasets: sortedPlayersByFinalRank.map((player, index) => {
        const playerData = [1];

        filteredWeeks.slice(1).forEach((week) => {
          const leaderboardForWeek = fetchedWeeklyLeaderboards.find(w => w.Week === week);

          const ranksForWeek = calculateRanksForWeek(leaderboardForWeek, fetchedPlayers);
          const rank = ranksForWeek.get(player.playerId) || fetchedPlayers.length;

          playerData.push(rank);
        });

        return {
          label: player.teamName,
          data: playerData,
          fill: false,
          borderColor: generateDistinctColor(index, sortedPlayersByFinalRank.length),
          backgroundColor: generateDistinctColor(index, sortedPlayersByFinalRank.length),
          tension: 0.1,
        };
      }),
    };
    setChartData(dataForChart);
  }, [fetchedPlayers, fetchedWeeklyLeaderboards, fetchedCurWeek]);

  const primaryTextColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-txt-color').trim();

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 20,
          font: {
            size: 16,
          },
          padding: 20,
          color: primaryTextColor,
        },
      },
      title: {
        display: true,
        text: 'Players\' Weekly Standings',
        color: primaryTextColor,
        font: {
          size: 20,
          family: 'Arial',
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Weeks',
          color: primaryTextColor,
          font: {
            family: 'Arial',
            size: 14,
          },
        },
        ticks: {
          color: primaryTextColor,
        },
        grid: {
          color: primaryTextColor,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Position',
          color: primaryTextColor,
          font: {
            family: 'Arial',
            size: 14,
          },
        },
        ticks: {
          color: primaryTextColor,
          stepSize: 1,
          beginAtZero: false,
        },
        grid: {
          color: primaryTextColor,
        },
        reverse: true,
      },
    },
    elements: {
      line: {
        borderColor: primaryTextColor,
        borderWidth: 2,
      },
      point: {
        radius: 3,
        hoverRadius: 7,
      },
    },
  };

  return (
    <div className="RankPoints-Graph">
      {chartData ? (
        <Line data={chartData} options={lineOptions} />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
};