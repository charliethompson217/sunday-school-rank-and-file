import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { DataContext } from './DataContext';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const weekOptions = [
  'Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8',
  'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16', 'Week 17', 'Week 18'
];

export default function WeeklyPointsGraph() {
  const { fetchedPlayers, fetchedWeeklyLeaderboards, fetchedCurWeek } = useContext(DataContext);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const generateDistinctColor = (index, totalPlayers) => {
    const hue = (index / totalPlayers) * 300;
    return `hsl(${hue}, 100%, 50%)`;
  };

  const sortedPlayers = useMemo(() => {
    const getCurrentWeekIndex = () => {
      if (fetchedCurWeek) {
        return weekOptions.indexOf(fetchedCurWeek);
      }
      return weekOptions.length - 1;
    };

    if (!fetchedPlayers || !fetchedWeeklyLeaderboards || !fetchedCurWeek) return [];

    const currentWeekIndex = getCurrentWeekIndex();
    const previousWeekIndex = currentWeekIndex - 1;

    const leaderboardForCurrentWeek = fetchedWeeklyLeaderboards.find(w => w.Week === fetchedCurWeek);
    const leaderboardForPreviousWeek = fetchedWeeklyLeaderboards.find(w => w.Week === weekOptions[previousWeekIndex]);

    const playersWithSlope = fetchedPlayers
      .filter(player => player.RankPoints !== null && player.RankPoints !== undefined)
      .map(player => {
        const currentWeekStats = leaderboardForCurrentWeek?.data.find(p => p[0] === player.playerId);
        const previousWeekStats = leaderboardForPreviousWeek?.data.find(p => p[0] === player.playerId);

        const currentRankPoints = parseFloat(currentWeekStats?.[1]) || 0;
        const previousRankPoints = parseFloat(previousWeekStats?.[1]) || 0;

        const pointsThisWeek = currentRankPoints - previousRankPoints;

        return { ...player, pointsThisWeek };
      });

    return playersWithSlope.sort((a, b) => b.pointsThisWeek - a.pointsThisWeek).reverse();
  }, [fetchedPlayers, fetchedWeeklyLeaderboards, fetchedCurWeek]);

  useEffect(() => {
    const getCurrentWeekIndex = () => {
      if (fetchedCurWeek) {
        return weekOptions.indexOf(fetchedCurWeek);
      }
      return weekOptions.length - 1;
    };

    if (!sortedPlayers || sortedPlayers.length === 0) return;

    const currentWeekIndex = getCurrentWeekIndex();
    const filteredWeeks = weekOptions.slice(0, currentWeekIndex);

    const dataForChart = {
      labels: filteredWeeks,
      datasets: sortedPlayers.map((player, index) => {
        const playerData = [0];
        let cumulativePoints = 0;

        filteredWeeks.slice(1).forEach((week) => {
          const leaderboardForWeek = fetchedWeeklyLeaderboards.find(w => w.Week === week);
          const playerStats = leaderboardForWeek?.data.find(p => p[0] === player.playerId);

          if (playerStats) {
            const rankPoints = parseFloat(playerStats[1]);
            if (!isNaN(rankPoints)) {
              cumulativePoints += rankPoints;
              playerData.push(rankPoints);
            } else {
              playerData.push(0);
            }
          } else {
            playerData.push(0);
          }
        });

        return { label: player.teamName, data: playerData, fill: false, cumulativePoints };
      })
    };

    dataForChart.datasets.sort((a, b) => b.cumulativePoints - a.cumulativePoints);

    dataForChart.datasets = dataForChart.datasets.map((dataset, index) => ({
      ...dataset,
      borderColor: generateDistinctColor(index, sortedPlayers.length),
      backgroundColor: generateDistinctColor(index, sortedPlayers.length),
      tension: 0.1
    }));

    setChartData(dataForChart);
  }, [sortedPlayers, fetchedWeeklyLeaderboards, fetchedCurWeek]);

  const primaryTextColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-txt-color').trim();

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
        text: 'Players\' Points Earned Each Week',
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
        grid: {
          color: primaryTextColor,
        },
        ticks: {
          color: primaryTextColor,
        }
      },
      y: {
        title: {
          display: true,
          text: 'Points Earned',
          color: primaryTextColor,
          font: {
            family: 'Arial',
            size: 14,
          },
        },
        grid: {
          color: primaryTextColor,
        },
        beginAtZero: true,
        ticks: {
          color: primaryTextColor,
          stepSize: 10,
          callback: function (value) {
            if (value % 10 === 0) {
              return value;
            }
          },
        },
      },
    },
    elements: {
      line: {
        borderColor: primaryTextColor,
        borderWidth: 1,
      },
      point: {
        radius: 1,
        hoverRadius: 3,
      },
    },
  };

  return (
    <div className="RankPoints-Graph" style={{ height: '1300px' }}>
      {chartData ? (
        <Line data={chartData} options={lineOptions} />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
};