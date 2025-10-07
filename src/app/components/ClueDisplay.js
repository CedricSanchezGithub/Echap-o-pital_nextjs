"use client";

import { useState, useEffect } from 'react';

export default function ClueDisplay({ clue, isVisible, onClose }) {
  const [animationClass, setAnimationClass] = useState('opacity-0 scale-95');
  
  useEffect(() => {
    let timer;
    if (isVisible) {
      // Animation d'entrée
      setAnimationClass('opacity-100 scale-100');
      
      // Auto-fermeture après 5 secondes
      timer = setTimeout(() => {
        if (onClose) onClose();
      }, 5000);
    } else {
      setAnimationClass('opacity-0 scale-95');
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, onClose]);
  
  if (!isVisible || !clue) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        className={`bg-black border-2 border-yellow-600 rounded-lg p-6 max-w-md transition-all duration-500 ${animationClass}`}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-yellow-500 text-xl font-bold">
            {clue.title || 'Indice découvert!'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <div className="text-white mb-4">
          <p>{clue.description}</p>
        </div>
        
        {clue.image && (
          <div className="flex justify-center mb-4">
            <div className="relative h-40 w-40">
              <Image
                src={clue.image}
                alt={clue.title}
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}
