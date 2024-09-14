import React from 'react';
import QuestionWithTwoButtons from './QuestionWithTwoButtons';

const RankPicks = ({ rankMatchups = [], rankPicks = [], onRankPicksChange = () => {} }) => {
  return (
    <>
      <h3>Rank Picks</h3>
      <p>First, you will pick all your Rank winners. Later, you will rank your selected Rank winners.</p>
      <div className='RankPicks'>
        {rankMatchups.map((data, index) => (
          <div className='Matchup' key={index}>
            <QuestionWithTwoButtons
              question={`${data[0]} @ ${data[1]}`}
              label1={data[0]}
              label2={data[1]}
              description={data[2]}
              answer={rankPicks[index]?.value || ''}  // Provide a fallback in case rankPicks[index] is undefined
              onInputChange={(value) => onRankPicksChange(index, value)}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default RankPicks;
