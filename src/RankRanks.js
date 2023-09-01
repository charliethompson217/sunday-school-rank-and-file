import React, { useState } from 'react';
import './App.css';

const RankRanks = ({ rankedRanks, rankPicks, onRankChange }) => {
  const [rankedOptions, setRankedOptions] = useState(rankedRanks);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDraggedOverIndex(index);
  };

  const handleDrop = (e, newIndex) => {
    e.preventDefault();
    const oldIndex = e.dataTransfer.getData('text/plain');
    const newOptions = [...rankedOptions];
    const [draggedItem] = newOptions.splice(oldIndex, 1);
    newOptions.splice(newIndex, 0, draggedItem);
    setRankedOptions(newOptions);
    onRankChange(newOptions);
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  const handleTouchStart = (e, index) => {
    setDraggedIndex(index);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.tagName === 'LI') {
      const newIndex = Array.from(target.parentNode.children).indexOf(target);
      setDraggedOverIndex(newIndex);
    }
  };

  const handleTouchEnd = (e, newIndex) => {
    if (draggedIndex !== null && draggedOverIndex !== null) {
      const newOptions = [...rankedOptions];
      const [draggedItem] = newOptions.splice(draggedIndex, 1);
      newOptions.splice(newIndex, 0, draggedItem);
      setRankedOptions(newOptions);
      onRankChange(newOptions);
    }
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  function keepLastWord(inputString) {
    const words = inputString.split(' ');
    if (words.length > 0) {
      const lastWord = words[words.length - 1];
      return lastWord;
    }
    return inputString;
  }

  return (
    <div className='ranked-ranks'>
      <h3>Rank Ordering</h3>
      <p>
        Now, you will rank your selected Rank winners. Rank your highest points at top and lowest points at bottom. The rank number next to each team is how many points you will earn if that team wins. This also means that your five picks closest from the bottom (picks 1 through 5) will be the teams that must win in order for you to earn the weekly bonus.
        <br></br>
        <br></br>
        For mobile users, simply press and hold to move your rank selections.
      </p>

      <ul>
        {rankedOptions.map((option, index) => (
          <li
            key={option}
            className={`${
              index === draggedIndex ? 'dragged' : ''
            } ${index === draggedOverIndex ? 'empty' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onTouchStart={(e) => handleTouchStart(e, index)}
            onTouchMove={handleTouchMove}
            onTouchEnd={(e) => handleTouchEnd(e, index)}
          >
            <label>{rankedOptions.length - index}</label>
            {` ${rankPicks[option - 1].value} (vs ${keepLastWord(
              rankPicks[option - 1].game.find(
                (team) => team !== rankPicks[option - 1].value
              )
            )})`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RankRanks;
