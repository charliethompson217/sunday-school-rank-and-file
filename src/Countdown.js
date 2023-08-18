import React, { useState, useEffect } from 'react';
import { differenceInMilliseconds } from 'date-fns';
import './Countdown.css';

const Countdown = ({ targetDate }) => {
  const nowUTC = new Date().toISOString(); // Get current UTC time
  const initialRemainingTime = targetDate ? differenceInMilliseconds(new Date(targetDate), new Date(nowUTC)) : 0;
  const [remainingTime, setRemainingTime] = useState(initialRemainingTime);
  
  useEffect(() => {
    if (targetDate) {
      const interval = setInterval(() => {
        const nowUTC = new Date().toISOString();
        setRemainingTime(differenceInMilliseconds(new Date(targetDate), new Date(nowUTC)));
      }, 1000);
  
      return () => {
        clearInterval(interval);
      };
    }
  }, [targetDate]);

  const days = Math.max(0, Math.floor(remainingTime / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const minutes = Math.max(0, Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60)));
  const seconds = Math.max(0, Math.floor((remainingTime % (1000 * 60)) / 1000));

  return (
    <div className="countdown">
      <div className="countdown-item">
        <div className="countdown-value">{targetDate ? days : 0}</div>
        <div className="countdown-label">Days</div>
      </div>
      <div className="countdown-item">
        <div className="countdown-value">{targetDate ? hours : 0}</div>
        <div className="countdown-label">Hours</div>
      </div>
      <div className="countdown-item">
        <div className="countdown-value">{targetDate ? minutes : 0}</div>
        <div className="countdown-label">Minutes</div>
      </div>
      <div className="countdown-item">
        <div className="countdown-value">{targetDate ? seconds : 0}</div>
        <div className="countdown-label">Seconds</div>
      </div>
    </div>
  );
};

export default Countdown;
