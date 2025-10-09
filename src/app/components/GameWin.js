"use client";

import { useRouter } from 'next/navigation';

export default function GameWin() {
    const router = useRouter();

    return (
        <div className="bg-gray-900 text-white flex flex-col items-center justify-center h-screen">
            <h1 className="text-8xl font-bold text-green-400 animate-pulse">VOUS VOUS ÊTES ÉCHAPPÉ !</h1>
            <p className="text-2xl mt-4 text-gray-300">Félicitations, vous avez survécu à l&#39;Echap-o-pital.</p>
            <button
                onClick={() => router.push('/')}
                className="mt-12 px-10 py-4 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-2xl font-bold rounded-full"
            >
                Rejouer
            </button>
        </div>
    );
}