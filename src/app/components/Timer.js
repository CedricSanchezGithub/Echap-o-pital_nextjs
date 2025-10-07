"use client";

import { useEffect } from 'react';
import { useGameContext } from '../context/GameContext';

export default function Timer({ initialTime = 3600 }) {
  const { timeLeft, setTimeLeft, setGameOver } = useGameContext();
  
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timerInterval);
          setGameOver(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [setTimeLeft, setGameOver]);
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  let timerColor = "text-white";
  if (timeLeft < 300) {
    timerColor = "text-red-500";
  } else if (timeLeft < 600) {
    timerColor = "text-yellow-500";
  }
  
  return (
    <div className={`font-mono text-xl md:text-2xl font-bold ${timerColor} bg-black/50 p-2 rounded-lg`}>
      {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
    </div>
  );
}
