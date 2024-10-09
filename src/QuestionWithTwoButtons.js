import React, { useEffect, useState } from 'react';
import logoMap from './assets/logos';

export default function QuestionWithTwoButtons({ question, label1, label2, answer, onInputChange, description }) {
  const [selectedOption, setSelectedOption] = useState(answer);

  useEffect(() => {
    setSelectedOption(answer);
  }, [answer]);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    onInputChange(option);
  };

  function keepLastWord(inputString) {
    if (typeof inputString !== 'string' || inputString.trim() === '') {
      return '';
    }
    const words = inputString.split(' ');
    return words[words.length - 1];
  };

  return (
    <div className='QuestionWithTwoButtons'>
      <div className='Question-Description'>
        <label>{description}</label>
      </div>

      <div className='Question-Description'>
        <label>{question}</label>
      </div>
      <div>
        <button
          type="button"
          onClick={() => handleOptionClick(label1)}
          className={`option-button ${selectedOption === label1 ? 'selected' : ''} ${selectedOption === label2 ? 'unselected' : ''}`}
        >
          <img
            src={logoMap[keepLastWord(label1)]}
            alt={keepLastWord(label1)}
          />
          <span>{keepLastWord(label1)}</span>
        </button>
        <button
          type="button"
          onClick={() => handleOptionClick(label2)}
          className={`option-button ${selectedOption === label2 ? 'selected' : ''} ${selectedOption === label1 ? 'unselected' : ''}`}
        >
          <img
            src={logoMap[keepLastWord(label2)]}
            alt={keepLastWord(label2)}
          />
          <span>{keepLastWord(label2)}</span>
        </button>
      </div>
    </div>
  );
};