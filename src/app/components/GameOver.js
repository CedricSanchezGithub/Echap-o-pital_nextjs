"use client";

import { useRouter } from 'next/navigation';

export default function GameOver() {
    const router = useRouter();

    return (
        <div className="bg-black text-white flex flex-col items-center justify-center h-screen">
            <h1 className="text-9xl font-bold text-red-600 animate-pulse">YOU ARE DEAD</h1>
            <button
                onClick={() => {

                     window.location.href = 'http://localhost:8081/api/maboule/reset';
                    router.push('/');
                }}
                className="mt-8 px-10 py-4 bg-gray-700 hover:bg-gray-600 transition-colors text-white text-2xl font-bold rounded-full"
            >
                Retourner à accumulate
            </button>
        </div>
    );
}