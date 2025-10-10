"use client";

import {useRouter} from 'next/navigation';
import {useState, useEffect} from 'react';
import Image from 'next/image';

import HealthBar from '../components/HealthBar';
import PlayerCharacter from '../components/PlayerCharacter';
import NavigationButtons from '../components/NavigationButtons';
import DoctorNPC from '../components/DoctorNPC';
import ServiceHeader from '../components/ServiceHeader';
import {useGameContext} from '../context/GameContext';
import GameOver from "@/app/components/GameOver";
import GameWin from "@/app/components/GameWin";

export default function GamePage() {
    const router = useRouter();
    const {
        gameWon,
        gameOver,
        health,
        currentRoom,
        setCurrentRoom,
        playerNumber,
        playerSymptom,
        currentService,
        currentBackground,
        currentRoomAmbiance,
        showDoctor,
        doctorMessage,
        doctorChoices,
        inventory,
        pickupItem,
        itemAvailable,
        lastEvent,
        availableRooms,
        cluesFound,
        showDoctorChoice,
        setShowDoctorChoice,
        handleDoctorChoice,
        continueStory,
        isDialogueFinal,
        popupMessage,
        showPopup,
        mabouleErrorCount,
        visitedRooms
    } = useGameContext();
    const [gameStarted, setGameStarted] = useState(false);
    const [dialogueStep, setDialogueStep] = useState(0);
    const [showNavigation, setShowNavigation] = useState(false);
    const [showInventory, setShowInventory] = useState(false);
    const [eventAnimationActive, setEventAnimationActive] = useState(false);
    const [forceUpdate, setForceUpdate] = useState(0);

    useEffect(() => {
        setGameStarted(true);
    }, []);

    useEffect(() => {
        if (lastEvent) {
            setEventAnimationActive(true);
            const timer = setTimeout(() => setEventAnimationActive(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [lastEvent]);

    const initialDialogues = [
        "Bonjour ? Il y a quelqu'un ? Je ne me sens pas très bien...",
        playerSymptom ? playerSymptom.description : "Je me sens vraiment mal...",
        "J'ai besoin de voir un médecin rapidement. Cet hôpital semble... étrange.",
        "Je devrais chercher de l'aide. Mais où aller ?"
    ];

    const dialogues = currentService ? [] : initialDialogues;

    useEffect(() => {
        setDialogueStep(0);
        if (!showDoctor) {
            setShowNavigation(true);
        }
    }, [currentRoom, showDoctor]);

    useEffect(() => {
        if (currentService && !currentRoom?.startsWith('corridor')) {
            const timer = setTimeout(() => {
                setForceUpdate(prev => prev + 1);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [currentService, currentRoom]);

    const handleNextDialogue = () => {
        if (dialogueStep < dialogues.length - 1) {
            setDialogueStep(dialogueStep + 1);
        } else {
            setShowNavigation(true);
        }
    };

    const handleChoiceSelection = (choiceId) => {
        if (isDialogueFinal) {
            handleDoctorChoice(choiceId);
        } else {
            continueStory(choiceId);
        }
    };

    const handlePickupItem = () => {
        if (itemAvailable && pickupItem(itemAvailable)) {
            //
        }
    };

    const handleNavigate = (direction) => {
        setShowNavigation(false);
        const currentRoomData = availableRooms[currentRoom] || {};
        const destination = currentRoomData.exits?.[direction];

        switch (direction) {
            case 'left':
            case 'right':
                setCurrentRoom(destination || 'randomRoom');
                break;
            case 'forward':
            default:
                if (destination) {
                    setCurrentRoom(destination);
                } else {
                    if (currentRoom === 'corridor1') setCurrentRoom('corridor2');
                    else if (currentRoom === 'corridor2') setCurrentRoom('corridor3');
                    else setCurrentRoom('corridor1'); // Fallback
                }
                break;
        }
    };

    const getBackgroundImage = () => {
        if (currentRoom.startsWith('corridor') || ['corridor1', 'corridor2', 'corridor3'].includes(currentBackground)) {
            return '/images/backgrounds/corridor1.jpg';
        }
        const roomNumber = currentBackground?.match(/\d+/)?.[0] || '1';
        return `/images/backgrounds/room${roomNumber}.png`;
    };

    if (gameOver) return <GameOver />;
    if (gameWon) return <GameWin />;

    return (
        <div className="font-sans min-h-screen w-full relative flex flex-col">
            <div className="absolute inset-0 z-0">
                <Image src={getBackgroundImage()} alt="Hospital room" fill style={{objectFit: 'cover'}} priority />
            </div>

            <div className="relative z-10 flex flex-col h-screen">
                <div className="flex justify-end items-start p-4">
                    <div className="flex flex-col items-end">
                        <button className="mt-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm" onClick={() => setShowInventory(!showInventory)}>
                            Inventaire ({inventory.length})
                        </button>
                    </div>
                </div>

                {showInventory && (
                    <div className="absolute top-24 right-4 z-30 bg-black/80 backdrop-blur-sm border border-white/20 p-4 rounded-lg text-white">
                        <h3 className="font-bold text-lg mb-2">Inventaire</h3>
                        {inventory.length === 0 ? <p className="text-gray-400">Votre inventaire est vide</p> : <ul>{inventory.map((item, index) => <li key={index}>{item}</li>)}</ul>}
                    </div>
                )}

                {eventAnimationActive && lastEvent && (
                    <div className="absolute top-1/3 left-0 right-0 z-30 flex justify-center">
                        <div className="bg-red-900/70 backdrop-blur-md border border-red-700 p-4 rounded-lg text-white animate-pulse max-w-md">
                            <h3 className="font-bold text-lg mb-2 text-red-400">{lastEvent.name}</h3>
                            <p>{lastEvent.description}</p>
                        </div>
                    </div>
                )}

                {showPopup && popupMessage && (
                    <div className="absolute top-1/2 left-0 right-0 z-50 flex justify-center transform -translate-y-1/2">
                        <div className="bg-blue-900/90 backdrop-blur-md border border-blue-700 p-6 rounded-lg text-white max-w-md shadow-xl">
                            <h3 className="font-bold text-xl mb-2 text-blue-300">Résultat</h3>
                            <p className="text-lg">{popupMessage}</p>
                        </div>
                    </div>
                )}

                <ServiceHeader key={`service-header-${forceUpdate}-${currentRoom}`} serviceName={currentService?.name} serviceDescription={currentService?.description} isCorridor={currentRoom.startsWith('corridor')} />

                <div className="flex-grow flex items-center justify-center">
                    {showDoctor && (
                        <DoctorNPC message={doctorMessage} onMessageEnd={() => setShowDoctorChoice(true)} />
                    )}
                </div>

                <div className="p-6 pt-8 pb-10 bg-black/60 backdrop-blur-md">
                    {gameStarted && (
                        <div className="flex flex-col gap-8 max-w-6xl mx-auto">
                            {!showDoctor && dialogueStep < dialogues.length && (
                                <PlayerCharacter playerNumber={playerNumber} message={dialogues[dialogueStep]} onMessageEnd={handleNextDialogue} />
                            )}

                            {showNavigation && currentRoom.startsWith('corridor') && (
                                <div className="mt-8">
                                    <NavigationButtons onNavigate={handleNavigate} />
                                </div>
                            )}

                            {showDoctorChoice && doctorChoices.length > 0 && (
                                <div className="flex justify-center flex-wrap gap-6 mt-8">
                                    {doctorChoices.map((choice) => (
                                        <button
                                            key={choice.id}
                                            onClick={() => handleChoiceSelection(choice.id)}
                                            className={`px-8 py-4 rounded-lg shadow-lg font-bold transition-all text-white ${
                                                isDialogueFinal
                                                    ? (choice.id === 'trust' ? 'bg-green-700 hover:bg-green-600' : 'bg-red-700 hover:bg-red-600')
                                                    : 'bg-blue-800 hover:bg-blue-700'
                                            }`}
                                        >
                                            {choice.texte}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {itemAvailable && showNavigation && currentRoom.startsWith('corridor') && (
                                <div className="mt-4 flex justify-center">
                                    <button onClick={handlePickupItem} className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg transition-colors">
                                        Ramasser: {itemAvailable}
                                    </button>
                                </div>
                            )}

                            {currentRoomAmbiance && (
                                <div className="mt-4 text-gray-300 italic text-sm max-w-2xl mx-auto text-center">
                                    <p>{currentRoomAmbiance}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                <button onClick={() => router.push('/')} className="px-3 py-1 bg-red-600 hover:bg-red-700 transition-colors rounded text-sm text-white">
                    Quitter
                </button>
                <div className="mt-1">
                    <HealthBar initialHealth={health} label="Santé" color="red"/>
                </div>
                <div className="px-3 py-1 bg-yellow-700 rounded text-sm text-white">
                    Illuminatis trouvés: {cluesFound}
                </div>
                <div className="px-3 py-1 bg-red-900 border border-red-500 rounded text-sm text-white font-bold">
                    Erreurs Maboule: {mabouleErrorCount}
                </div>
            </div>
        </div>
    );
}