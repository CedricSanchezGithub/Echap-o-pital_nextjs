"use client";

import { useEffect } from 'react';
import { useGameContext } from '../context/GameContext';

export default function Timer({ initialTime = 3600 }) {
  // Utiliser le contexte du jeu
  const { timeLeft, setTimeLeft, setGameOver } = useGameContext();
  
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timerInterval);
          // Fin du jeu quand le temps est écoulé
          setGameOver(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [setTimeLeft, setGameOver]);
  
  // Formatage du temps en minutes:secondes
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // Changer la couleur en fonction du temps restant
  let timerColor = "text-white";
  if (timeLeft < 300) { // Moins de 5 minutes
    timerColor = "text-red-500";
  } else if (timeLeft < 600) { // Moins de 10 minutes
    timerColor = "text-yellow-500";
  }
  
  return (
    <div className={`font-mono text-xl md:text-2xl font-bold ${timerColor} bg-black/50 p-2 rounded-lg`}>
      {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
    </div>
  );
}
