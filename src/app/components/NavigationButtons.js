"use client";

import { useState } from 'react';
import { useGameContext } from '../context/GameContext';

export default function NavigationButtons({ onNavigate, customLabels }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { currentRoom, availableRooms, inventory } = useGameContext();
    const isDirectionAvailable = (direction) => {
    if (!currentRoom || !availableRooms[currentRoom]) return true;
    
    const exit = availableRooms[currentRoom].exits?.[direction];
    
    if (!exit) return false;
    
    if (availableRooms[exit]?.locked) {
      const requiredItems = availableRooms[exit].requiredItems || [];
      return requiredItems.every(item => inventory.includes(item));
    }
    
    return true;
  };
  
  const getButtonLabel = (direction) => {
    if (customLabels && customLabels[direction]) {
      return customLabels[direction];
    }
    
    if (direction === 'left') return "← Porte de gauche";
    if (direction === 'forward') {
      if (currentRoom === 'corridor3' || 
          (availableRooms[currentRoom] && 
           availableRooms[currentRoom].exits?.forward === 'exit')) {
        return "↑ Sortie";
      }
      return "↑ Continuer";
    }
    if (direction === 'right') return "Porte de droite →";
    
    return direction;
  };
    const handleClick = (direction) => {
    setIsAnimating(true);
    
    setTimeout(() => {
      setIsAnimating(false);
      if (onNavigate) onNavigate(direction);
    }, 300);
  };
  
  return (
    <div className="flex justify-center gap-4 md:gap-10 w-full">
      {isDirectionAvailable('left') ? (
        <button
          onClick={() => handleClick('left')}
          className={`px-8 py-4 bg-blue-800 hover:bg-blue-700 text-white text-lg font-bold rounded-lg transition-all shadow-lg hover:shadow-xl ${
            isAnimating ? 'scale-95' : 'scale-100'
          }`}
          disabled={isAnimating}
        >
          {getButtonLabel('left')}        </button>
      ) : (
        <div className="w-40"></div>
      )}
      
      {isDirectionAvailable('forward') ? (
        <button
          onClick={() => handleClick('forward')}
          className={`px-8 py-4 ${
            getButtonLabel('forward').includes('Sortie') 
              ? 'bg-green-700 hover:bg-green-600' 
              : 'bg-blue-800 hover:bg-blue-700'
          } text-white text-lg font-bold rounded-lg transition-all shadow-lg hover:shadow-xl ${
            isAnimating ? 'scale-95' : 'scale-100'
          }`}
          disabled={isAnimating}
        >
          {getButtonLabel('forward')}        </button>
      ) : (
        <div className="w-40"></div>
      )}
      
      {isDirectionAvailable('right') ? (
        <button
          onClick={() => handleClick('right')}
          className={`px-8 py-4 bg-blue-800 hover:bg-blue-700 text-white text-lg font-bold rounded-lg transition-all shadow-lg hover:shadow-xl ${
            isAnimating ? 'scale-95' : 'scale-100'
          }`}
          disabled={isAnimating}
        >
          {getButtonLabel('right')}        </button>
      ) : (
        <div className="w-40"></div>
      )}
    </div>
  );
}
