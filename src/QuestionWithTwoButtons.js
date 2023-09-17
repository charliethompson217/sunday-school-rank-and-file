import React, { useEffect, useState } from 'react';
import Cardinals from './assets/ARI.svg';
import Panthers from './assets/CAR.svg'; 
import Falcons from './assets/ATL.svg';
import Texans from './assets/HOU.svg';
import Ravens from './assets/BAL.svg';
import Bengals from './assets/CIN.svg';
import Browns from './assets/CLE.svg';
import Jaguars from './assets/JAX.svg';
import Colts from './assets/IND.svg';
import Buccaneers from './assets/TB.svg';
import Vikings from './assets/MIN.svg';
import Titans from './assets/TEN.svg';
import Saints from './assets/NO.svg';
import san49ers from './assets/SF.svg';
import Commanders from './assets/WAS.svg';
import Packers from './assets/GB.svg';
import Bears from './assets/CHI.svg';
import Raiders from './assets/LV.svg';
import Broncos from './assets/DEN.svg';
import Steelers from './assets/PIT.svg';
import Dolphins from './assets/MIA.svg';
import Chargers from './assets/LAC.svg';
import Eagles from './assets/PHI.svg';
import Patriots from './assets/NE.svg';
import Rams from './assets/LA.svg';
import Seahawks from './assets/SEA.svg';
import Cowboys from './assets/DAL.svg';
import Giants from './assets/NYG.svg';
import Bills from './assets/BUF.svg';
import Jets from './assets/NYJ.svg';
import Lions from './assets/DET.svg';
import Chiefs from './assets/KC.svg';
const QuestionWithTwoButtons = ({ question, label1, label2, answer, onInputChange, description}) => {
  const [selectedOption, setSelectedOption] = useState(answer);
  
  useEffect(() => {
    setSelectedOption(answer);
    console.log(selectedOption);
    console.log(answer);
  }, [answer]);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    onInputChange( option); 
  };
  const logoMap = {
    'Panthers': Panthers,
    'Falcons': Falcons,
    'Texans': Texans,
    'Ravens': Ravens,
    'Bengals': Bengals,
    'Browns': Browns,
    'Jaguars': Jaguars,
    'Colts': Colts,
    'Buccaneers': Buccaneers,
    'Vikings': Vikings,
    'Titans': Titans,
    'Saints': Saints,
    '49ers': san49ers,
    'Cardinals': Cardinals,
    'Commanders': Commanders,
    'Packers': Packers,
    'Bears': Bears,
    'Raiders': Raiders,
    'Broncos': Broncos,
    'Steelers': Steelers,
    'Dolphins': Dolphins,
    'Chargers': Chargers,
    'Eagles': Eagles,
    'Patriots': Patriots,
    'Rams': Rams,
    'Seahawks': Seahawks,
    'Cowboys': Cowboys,
    'Giants': Giants,
    'Bills': Bills,
    'Jets': Jets,
    'Lions': Lions,
    'Chiefs': Chiefs,
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
          className={`option-button ${selectedOption === label1 ? 'selected' : ''}`}
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
          className={`option-button ${selectedOption === label2 ? 'selected' : ''}`}
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

export default QuestionWithTwoButtons;
