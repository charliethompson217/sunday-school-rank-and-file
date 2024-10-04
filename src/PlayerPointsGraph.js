import React, { useState, useEffect, useContext } from 'react';
import { Line } from 'react-chartjs-2';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { DataContext } from './DataContext';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

Amplify.configure(awsExports);

const PlayerPointsGraph = () => {
  const { fetchedPlayers, fetchedWeeklyLeaderboards, fetchedCurWeek } = useContext(DataContext);
  const [sortedPlayers, setSortedPlayers] = useState([]);
  const [chartData, setChartData] = useState(null);
  const weekOptions = [
    'Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8',
    'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16', 'Week 17', 'Week 18'
  ];

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
    if (fetchedPlayers && fetchedWeeklyLeaderboards && fetchedCurWeek) {
      const currentWeekIndex = getCurrentWeekIndex();
      const filteredWeeks = weekOptions.slice(0, currentWeekIndex);
  
      const dataForChart = {
        labels: filteredWeeks,
        datasets: sortedPlayers.map((player, index) => {
          let cumulativePoints = 0;
          const playerData = [0];
  
          filteredWeeks.slice(1).forEach((week) => {
            const leaderboardForWeek = fetchedWeeklyLeaderboards.find(w => w.Week === week);
            const playerStats = leaderboardForWeek?.data.find(p => p[0] === player.playerId);
  
            if (playerStats) {
              const rankPoints = parseFloat(playerStats[1]);
  
              if (!isNaN(rankPoints)) {
                cumulativePoints += rankPoints;
              }
              playerData.push(cumulativePoints);
            } else {
              playerData.push(cumulativePoints);
            }
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
  }, [sortedPlayers, fetchedWeeklyLeaderboards, fetchedCurWeek]);
  

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
        color: 'white',
      },
    },
    title: {
      display: true,
      text: 'Players\' Rank Points throughout the Season',
      color: 'white',
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
        color: 'white',
        font: {
          family: 'Arial',
          size: 14,
        },
      },
      grid: {
        color: ' rgba(255, 255, 255, 0.7)',
      },ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
      }
    },
    y: {
      title: {
        display: true,
        text: 'Cumulative RankPoints',
        color: 'white',
        font: {
          family: 'Arial',
          size: 14,
        },
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.7)',
      },
      beginAtZero: true,
      ticks: {
        color: 'white',
        stepSize: 50,
        callback: function(value) {
          if (value % 50 === 0) {
            return value;
          }
        },
      },
    },
  },
  elements: {
    line: {
      borderColor: 'white',
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

export default PlayerPointsGraph;