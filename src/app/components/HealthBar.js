"use client";

import { useGameContext } from '../context/GameContext';

export default function HealthBar({ initialHealth, label = "Santé", color = "red" }) {
  // Utiliser le contexte du jeu ou la valeur initiale fournie
  const { health, sanity } = useGameContext();
  // Déterminer la valeur à afficher (santé ou santé mentale)
  const value = initialHealth !== undefined ? initialHealth : (label === "Santé mentale" ? sanity : health);
  
  // Détermine la couleur de la barre en fonction du niveau et du type
  const getBarColor = () => {
    // Si une couleur personnalisée est fournie
    if (color === "blue") {
      // Couleurs pour la barre de santé mentale
      if (value > 70) return 'bg-blue-500';
      if (value > 40) return 'bg-blue-300';
      return 'bg-blue-700';
    } else {
      // Couleurs pour la barre de santé
      if (value > 70) return 'bg-green-500';
      if (value > 40) return 'bg-yellow-500';
      return 'bg-red-500';
    }
  };
  
  // Icône en fonction du type de barre
  const getIcon = () => {
    if (label === "Santé mentale") return '🧠';
    return '❤️';
  };
  
  return (
    <div className="bg-black/50 p-2 rounded-lg w-40">
      <div className="flex flex-col gap-1">
        <span className="text-white text-xs font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">{getIcon()}</span>
          <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full ${getBarColor()} transition-all duration-500`}
              style={{ width: `${value}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
