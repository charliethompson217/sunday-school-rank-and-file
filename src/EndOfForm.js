import React, { useContext }  from 'react';
import Navbar from './Navbar';
import { DataContext } from './DataContext';

export default function EndOfForm() {
  const {fetchedRankPicks, fetchedRankedRanks, fetchedFilePicks  } = useContext(DataContext);

  function keepLastWord(inputString) {
    if (typeof inputString !== 'string' || inputString.trim() === '') {
      return '';
    }
    const words = inputString.split(' ');
    return words[words.length - 1];
  };
  
  return (
    <>
      <Navbar></Navbar>
      <div className='navbar-offset-container'>
        <div className='end-of-form'>
            <h1>End of Form</h1>
            <p>Thank you for making your picks. They are below. Feel free to fill out the form as many times as you'd like. Only your most recent picks will be tabulated.</p>
            <h1>Ranked Picks</h1>
            <ul>
            {fetchedRankedRanks.map((num, index) => (
              <li
                key={index}
              >
                <label>{fetchedRankedRanks.length - index}</label>
                {` ${fetchedRankPicks[num-1].value} (vs ${keepLastWord(fetchedRankPicks[num - 1].game.find(
                    (team) => team !== fetchedRankPicks[num - 1].value
                  ))})`}
              </li>
            ))}
            </ul>
            <h1>File Picks</h1>
            <ul>
            {fetchedFilePicks.map((pick, index) => (
              <li key={index}>
                {` ${fetchedFilePicks[index].value} (vs ${keepLastWord(fetchedFilePicks[index].game.find(
                    (team) => team !== fetchedFilePicks[index].value
                  ))})`}
              </li>
            ))}
            </ul>
        </div>
      </div>
    </>
  )
}
