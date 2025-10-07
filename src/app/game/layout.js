"use client";

import { GameProvider } from '../context/GameContext';

export default function GameLayout({ children }) {
  return (
    <GameProvider>
      {children}
    </GameProvider>
  );
}
