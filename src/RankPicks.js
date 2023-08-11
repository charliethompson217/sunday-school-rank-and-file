import React from 'react';
import QuestionWithTwoButtons from './QuestionWithTwoButtons';


const RankPicks = ({rankMatchups, rankPicks, onRankPicksChange }) => {
  return (
    <div>
      <h3>Rank Picks</h3>
      <p>First, you will pick all your Rank winners. Later, you will rank your selected Rank winners.</p>
      {rankMatchups.map((data, index) => (
        <QuestionWithTwoButtons
          key={index}
          question={`${data[0]} @ ${data[1]}`}
          label1={data[0]}
          label2={data[1]}
          description={data[2]}
          answer={rankPicks[index].value}
          onInputChange={(value) => onRankPicksChange(index, value)}
        />
      ))}
    </div>
  );
};

export default RankPicks;
