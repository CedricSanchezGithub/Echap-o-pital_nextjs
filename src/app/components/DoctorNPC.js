"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function DoctorNPC({ message, onMessageEnd }) {
  const [isTyping, setIsTyping] = useState(true);
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  
  useEffect(() => {
    // Réinitialiser l'animation de texte quand le message change
    setIsTyping(true);
    setDisplayedMessage('');
    setCharIndex(0);
  }, [message]);
  
  useEffect(() => {
    if (isTyping && message) {
      // Animation d'écriture du texte lettre par lettre
      if (charIndex < message.length) {
        const timeout = setTimeout(() => {
          setDisplayedMessage(prev => prev + message[charIndex]);
          setCharIndex(prevIndex => prevIndex + 1);
        }, 30); // vitesse d'affichage du texte
        
        return () => clearTimeout(timeout);
      } else {
        setIsTyping(false);
        // Appeler le callback quand l'animation est terminée
        if (onMessageEnd) setTimeout(onMessageEnd, 1000);
      }
    }
  }, [charIndex, isTyping, message, onMessageEnd]);
  
  return (
    <div className="flex items-center">
      <div className="relative h-48 w-48 md:h-56 md:w-56">
        <Image
          src="/images/players/npc1.gif"
          alt="Médecin"
          fill
          style={{ objectFit: 'contain' }}
          className="drop-shadow-lg"
        />
      </div>
        {message && (
        <div className="bg-black/70 text-white p-5 rounded-lg ml-4 max-w-lg border border-gray-600 min-h-[12rem] md:min-h-[14rem] flex flex-col justify-center">
          <p className="text-xl md:text-2xl font-medium leading-relaxed">{displayedMessage}</p>
        </div>
      )}
    </div>
  );
}
