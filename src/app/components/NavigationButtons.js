"use client";

import { useState } from 'react';
import { useGameContext } from '../context/GameContext';

export default function NavigationButtons({ onNavigate, customLabels }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { currentRoom, availableRooms, inventory } = useGameContext();
  
  // Déterminer si une direction est disponible
  const isDirectionAvailable = (direction) => {
    if (!currentRoom || !availableRooms[currentRoom]) return true;
    
    const exit = availableRooms[currentRoom].exits?.[direction];
    
    // Si pas de sortie dans cette direction
    if (!exit) return false;
    
    // Si c'est une salle verrouillée, vérifier les objets requis
    if (availableRooms[exit]?.locked) {
      const requiredItems = availableRooms[exit].requiredItems || [];
      return requiredItems.every(item => inventory.includes(item));
    }
    
    return true;
  };
  
  // Déterminer les labels en fonction de la salle actuelle
  const getButtonLabel = (direction) => {
    // Utiliser des labels personnalisés s'ils sont fournis
    if (customLabels && customLabels[direction]) {
      return customLabels[direction];
    }
    
    // Sinon utiliser les labels par défaut
    if (direction === 'left') return "← Porte de gauche";
    if (direction === 'forward') {
      // Label spécial pour la sortie
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
    
    // Appeler le callback avec la direction choisie après une courte animation
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
          {getButtonLabel('left')}
        </button>
      ) : (
        <div className="w-40"></div> // Espace vide si pas de sortie à gauche
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
          {getButtonLabel('forward')}
        </button>
      ) : (
        <div className="w-40"></div> // Espace vide si pas de sortie en avant
      )}
      
      {isDirectionAvailable('right') ? (
        <button
          onClick={() => handleClick('right')}
          className={`px-8 py-4 bg-blue-800 hover:bg-blue-700 text-white text-lg font-bold rounded-lg transition-all shadow-lg hover:shadow-xl ${
            isAnimating ? 'scale-95' : 'scale-100'
          }`}
          disabled={isAnimating}
        >
          {getButtonLabel('right')}
        </button>
      ) : (
        <div className="w-40"></div> // Espace vide si pas de sortie à droite
      )}
    </div>
  );
}
