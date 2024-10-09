import React, { useState, useEffect, useContext } from 'react';
import { Line } from 'react-chartjs-2';
import { DataContext } from './DataContext';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const weekOptions = [
  'Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8',
  'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16', 'Week 17', 'Week 18'
];

export default function PlayerRankGraph() {
  const { fetchedPlayers, fetchedWeeklyLeaderboards, fetchedCurWeek } = useContext(DataContext);
  const [sortedPlayers, setSortedPlayers] = useState([]);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (fetchedPlayers && fetchedPlayers.length > 0) {
      const playersToSort = fetchedPlayers
        .filter(player => player.RankPoints !== null && player.RankPoints !== undefined)
        .map(player => ({ ...player, RankPoints: parseFloat(player.RankPoints) }));
      playersToSort.sort((a, b) => parseFloat(b['RankPoints']) - parseFloat(a['RankPoints']));
      setSortedPlayers(playersToSort);
    }
  }, [fetchedPlayers]);

  const generateDistinctColor = (index, totalPlayers) => {
    const hue = (index / totalPlayers) * 360;
    return `hsl(${hue}, 100%, 50%)`;
  };

  useEffect(() => {
    const getTeamName = (playerId) => {
      const player = fetchedPlayers.find(p => p.playerId === playerId);
      return player ? player.teamName : null;
    };

    const getCurrentWeekIndex = () => {
      if (fetchedCurWeek) {
        return weekOptions.indexOf(fetchedCurWeek);
      }
      return weekOptions.length - 1;
    };

    if (fetchedPlayers && fetchedWeeklyLeaderboards && fetchedCurWeek) {
      const currentWeekIndex = getCurrentWeekIndex();
      const filteredWeeks = weekOptions.slice(0, currentWeekIndex);

      const dataForChart = {
        labels: filteredWeeks,
        datasets: sortedPlayers.map((player, index) => {
          const playerData = [1];

          const cumulativePointsMap = new Map();

          filteredWeeks.slice(1).forEach((week, weekIndex) => {
            const leaderboardForWeek = fetchedWeeklyLeaderboards.find(w => w.Week === week);

            leaderboardForWeek?.data.forEach(p => {
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

            let currentRank = 1;
            let lastPoints = null;
            let playersWithSameRank = 0;

            sortedByPoints.forEach(([pId, points], idx) => {
              if (points === lastPoints) {
                playersWithSameRank++;
              } else {
                currentRank += playersWithSameRank;
                playersWithSameRank = 1;
              }

              if (pId === player.playerId) {
                playerData.push(currentRank);
              }

              lastPoints = points;
            });
          });


          return {
            label: getTeamName(player.playerId),
            data: playerData,
            fill: false,
            borderColor: generateDistinctColor(index, 20),
            backgroundColor: generateDistinctColor(index, 20),
            tension: 0.1,
          };
        }),
      };
      setChartData(dataForChart);
    }
  }, [sortedPlayers, fetchedWeeklyLeaderboards, fetchedCurWeek, fetchedPlayers]);

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
        text: 'Players\' Season Standings',
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