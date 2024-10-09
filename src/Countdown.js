import React, { useState, useEffect } from 'react';
import { differenceInMilliseconds } from 'date-fns';
import './Countdown.css';

export default function Countdown({ targetDate, onExpire }) {
  const nowUTC = new Date().toISOString();
  const initialRemainingTime = differenceInMilliseconds(new Date(targetDate), new Date(nowUTC));
  const [remainingTime, setRemainingTime] = useState(initialRemainingTime);

  useEffect(() => {
    if (targetDate) {
      const interval = setInterval(() => {
        const nowUTC = new Date().toISOString();
        const newRemainingTime = differenceInMilliseconds(new Date(targetDate), new Date(nowUTC));
        setRemainingTime(newRemainingTime);

        if (newRemainingTime <= 0) {
          if (onExpire) {
            onExpire();
          }
        }
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [targetDate, onExpire]);

  const isNegative = remainingTime < 0;
  const absRemainingTime = Math.abs(remainingTime);
  const days = Math.floor(absRemainingTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absRemainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absRemainingTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absRemainingTime % (1000 * 60)) / 1000);
  const countdownClass = remainingTime < 0 ? 'countdown countdown-zero' : 'countdown';

  return (
    <div className={countdownClass}>
      <div className="countdown-item">
        <div className="countdown-value">{Number.isFinite(days) ? (isNegative ? '-' : '') + days : '--'}</div>
        <div className="countdown-label">Days</div>
      </div>
      <div className="countdown-item">
        <div className="countdown-value">{Number.isFinite(hours) ? (isNegative ? '-' : '') + hours : '--'}</div>
        <div className="countdown-label">Hours</div>
      </div>
      <div className="countdown-item">
        <div className="countdown-value">{Number.isFinite(minutes) ? (isNegative ? '-' : '') + minutes : '--'}</div>
        <div className="countdown-label">Minutes</div>
      </div>
      <div className="countdown-item">
        <div className="countdown-value">{Number.isFinite(seconds) ? (isNegative ? '-' : '') + seconds : '--'}</div>
        <div className="countdown-label">Seconds</div>
      </div>
    </div>
  );
};