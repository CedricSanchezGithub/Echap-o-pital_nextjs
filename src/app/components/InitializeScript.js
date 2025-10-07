"use client";

import { useEffect, useRef } from 'react';

export default function InitializeScript() {
  useEffect(() => {
    // This script adds additional blood dripping effects
    const addBloodDrops = () => {
      const title = document.querySelector('[class*="bloodTitle"]');
      if (!title) return;
      
      const titleRect = title.getBoundingClientRect();
      const container = document.querySelector('[class*="titleContainer"]');
      
      for (let i = 0; i < 3; i++) {
        const drop = document.createElement('div');
        drop.style.position = 'absolute';
        drop.style.width = `${Math.random() * 4 + 3}px`;
        drop.style.height = `${Math.random() * 60 + 40}px`;
        drop.style.backgroundColor = '#9b0000';
        drop.style.borderRadius = '0 0 4px 4px';
        drop.style.left = `${Math.random() * 80 + 10}%`;
        drop.style.top = `${titleRect.height}px`;
        drop.style.zIndex = '1';
        drop.style.boxShadow = '0 0 5px rgba(255,0,0,0.7)';
        drop.style.opacity = '0';
        drop.style.transform = 'scaleY(0)';
        
        // Add animation
        drop.animate(
          [
            { transform: 'scaleY(0)', opacity: 0 },
            { transform: 'scaleY(1)', opacity: 1, offset: 0.3 },
            { transform: 'scaleY(1)', opacity: 1, offset: 0.8 },
            { transform: 'scaleY(0.8)', opacity: 0.7 }
          ], 
          { 
            duration: Math.random() * 3000 + 5000, 
            iterations: Infinity,
            delay: Math.random() * 2000
          }
        );
        
        if (container) container.appendChild(drop);
      }
    };
    
    // Run after a short delay to ensure the DOM is fully ready
    setTimeout(addBloodDrops, 500);
  }, []);
  
  return null;
}
