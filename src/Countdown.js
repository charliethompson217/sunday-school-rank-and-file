import React, { useState, useEffect } from 'react';
import { differenceInMilliseconds } from 'date-fns';
import './Countdown.css';

const Countdown = ({ targetDate }) => {
  const nowUTC = new Date().toISOString(); // Get current UTC time
  const [remainingTime, setRemainingTime] = useState(differenceInMilliseconds(new Date(targetDate), new Date(nowUTC)));
  
  useEffect(() => {
    const interval = setInterval(() => {
      const nowUTC = new Date().toISOString();
      setRemainingTime(differenceInMilliseconds(new Date(targetDate), new Date(nowUTC)));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [targetDate]);

  const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

  return (
    <div className="countdown">
      <div className="countdown-item">
        <div className="countdown-value">{days}</div>
        <div className="countdown-label">Days</div>
      </div>
      <div className="countdown-item">
        <div className="countdown-value">{hours}</div>
        <div className="countdown-label">Hours</div>
      </div>
      <div className="countdown-item">
        <div className="countdown-value">{minutes}</div>
        <div className="countdown-label">Minutes</div>
      </div>
      <div className="countdown-item">
        <div className="countdown-value">{seconds}</div>
        <div className="countdown-label">Seconds</div>
      </div>
    </div>
  );
};

export default Countdown;
