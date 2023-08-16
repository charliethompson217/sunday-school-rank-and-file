import React from 'react';

export default function EndOfForm({rankPicks, rankedRanks, filePicks}) {

  function keepLastWord(inputString) {
    const words = inputString.split(' ');
    if (words.length > 0) {
      const lastWord = words[words.length - 1];
      return lastWord;
    }
    return inputString;
  }
  return (
    <div className='end-of-form'>
        <h1>End of Form</h1>
        <p>Thank you for making your picks. They are below. Feel free to fill out the form as many times as you'd like. Only your most recent picks will be tabulated.</p>
        <h1>Ranked Picks</h1>
        <ul>
        {rankedRanks.map((num, index) => (
          <li
            key={index}
          >
            <label>{rankedRanks.length - index}</label>
            {` ${rankPicks[num-1].value} (vs ${keepLastWord(rankPicks[num - 1].game.find(
                (team) => team !== rankPicks[num - 1].value
              ))})`}
          </li>
        ))}
        </ul>
        <h1>File Picks</h1>
        <ul>
        {filePicks.map((pick, index) => (
          <li key={index}>
            {` ${filePicks[index].value} (vs ${keepLastWord(filePicks[index].game.find(
                (team) => team !== filePicks[index].value
              ))})`}
          </li>
        ))}
        </ul>
    </div>
  )
}
