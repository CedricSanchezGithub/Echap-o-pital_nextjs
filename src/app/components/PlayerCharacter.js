"use client";

import Image from 'next/image';
import { useTypingEffect } from '../hooks/useTypingEffect';

export default function PlayerCharacter({ playerNumber = 1, message, onMessageEnd }) {
    const { displayedMessage, isTyping, handleSkip } = useTypingEffect(message, onMessageEnd);

    return (
        <div className="flex items-center">
            <div className="relative h-48 w-48 md:h-56 md:w-56 flex-shrink-0">
                <Image
                    src={`/images/players/player${playerNumber}.gif`}
                    alt="Joueur"
                    fill
                    style={{ objectFit: 'contain' }}
                    className="drop-shadow-lg"
                />
            </div>
            {message && (
                <div className="relative bg-black/70 text-white p-5 rounded-lg ml-4 max-w-lg border border-gray-600 min-h-[12rem] md:min-h-[14rem] flex flex-col justify-center">
                    <p className="text-xl md:text-2xl font-medium leading-relaxed">{displayedMessage}</p>
                    <button
                        onClick={handleSkip}
                        className="absolute bottom-4 right-4 bg-gray-800 hover:bg-gray-700 text-white font-bold p-2 rounded-full transition-colors animate-pulse"
                        aria-label="Continuer"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>
            )}
        </div>
    );
}