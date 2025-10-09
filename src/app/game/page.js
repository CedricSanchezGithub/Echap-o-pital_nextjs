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
        inventory,
        pickupItem,
        itemAvailable,
        lastEvent,
        availableRooms,
        cluesFound,
        showDoctorChoice,
        setShowDoctorChoice,
        handleDoctorChoice,
        popupMessage,
        showPopup,
        mabouleErrorCount
    } = useGameContext();
    const [gameStarted, setGameStarted] = useState(false);
    const [dialogueStep, setDialogueStep] = useState(0);
    const [showNavigation, setShowNavigation] = useState(false);
    const [doctorDialogueStep, setDoctorDialogueStep] = useState(0);
    const [showDoctorDialogue, setShowDoctorDialogue] = useState(false);
    const [showInventory, setShowInventory] = useState(false);
    const [showItemPrompt, setShowItemPrompt] = useState(false);
    const [eventAnimationActive, setEventAnimationActive] = useState(false);
    const [forceUpdate, setForceUpdate] = useState(0);
    useEffect(() => {
        const timer = setTimeout(() => {
            setGameStarted(true);
            setShowDoctorDialogue(false);
        }, 1000);

        return () => clearTimeout(timer);
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

    const serviceDialogues = {
        cardiology: ["Cette salle est pleine d'équipements cardiaques...", "Les moniteurs affichent des battements étranges. Ce ne sont pas des rythmes humains."],
        pneumology: ["L'air est étouffant ici. Je sens une odeur chimique désagréable.", "Il y a des radiographies pulmonaires sur les murs. Certaines montrent des formes impossibles."],
        surgery: ["Des outils chirurgicaux brillent sous la lumière. Ils semblent... trop aiguisés.", "Il y a des traces rouges sur le sol qui mènent à cette table d'opération."],
        radiology: ["Les machines font un bruit inquiétant, même éteintes.", "Les écrans montrent des images que je n'arrive pas à comprendre. Est-ce vraiment humain?"],
        neurology: ["Les schémas de cerveau sur les murs semblent modifiés.", "Il y a des notes sur un 'implant neural de contrôle'. C'est de la science-fiction, n'est-ce pas?"],
        psychiatry: ["Les murs sont capitonnés. Pour empêcher le bruit de sortir?", "Il y a un dossier sur le bureau: 'Manipulation mentale et symbolisme - Projet Illuminati'"],
        emergency: ["Il n'y a personne aux urgences. C'est très inhabituel.", "Le registre des patients montre que personne n'est jamais ressorti d'ici..."],
        laboratory: ["Des échantillons étranges brillent dans des tubes à essai.", "Un microscope est allumé. Dans la lentille, je vois quelque chose qui... bouge tout seul."],
        pediatrics: ["Les dessins d'enfants sur les murs sont inquiétants. Tous montrent le même symbole triangulaire.", "Les jouets semblent avoir été abandonnés en plein milieu d'une activité."]
    };
    const dialogues = currentService ?
        serviceDialogues[currentService.id] || initialDialogues :
        initialDialogues;

    useEffect(() => {
        setDialogueStep(0);
        setDoctorDialogueStep(0);

        if (showDoctor) {
            setShowDoctorDialogue(true);
            setShowNavigation(false);
        } else {
            setShowDoctorDialogue(false);
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

    useEffect(() => {
        if (!showDoctorDialogue && dialogueStep >= dialogues.length - 1) {
            if (currentRoom && !currentRoom.startsWith('corridor')) {
                setShowNavigation(false);
                setShowDoctorChoice(true);
            } else {
                setShowNavigation(true);
                setShowDoctorChoice(false);
            }
        }
    }, [dialogueStep, dialogues.length, showDoctorDialogue, currentRoom, setShowDoctorChoice]);

    const handleNextDialogue = () => {
        if (dialogueStep < dialogues.length - 1) {
            setDialogueStep(dialogueStep + 1);
        } else {
            if (currentRoom && !currentRoom.startsWith('corridor')) {
                setShowDoctorChoice(true);
                setShowNavigation(false);
            } else {
                setShowNavigation(true);
                setShowDoctorChoice(false);
            }
        }
    };

    const handleDoctorDialogue = () => {
        if (doctorDialogueStep < 1) {
            setDoctorDialogueStep(doctorDialogueStep + 1);
        } else {
            setShowDoctorDialogue(false);

            if (currentRoom && !currentRoom.startsWith('corridor')) {
                setShowDoctorChoice(true);
                setShowNavigation(false);
            } else {
                setShowNavigation(true);
                setShowDoctorChoice(false);
            }
        }
    };
    const handlePickupItem = () => {
        if (itemAvailable && pickupItem(itemAvailable)) {
            setShowItemPrompt(false);
        }
    };

    const handleNavigate = (direction) => {
        setShowNavigation(false);
        setShowItemPrompt(false);

        switch (direction) {
            case 'left':
            case 'right':
                const currentRoomData = availableRooms[currentRoom] || {};
                const destination = currentRoomData.exits && currentRoomData.exits[direction];
                if (destination) {
                    setCurrentRoom(destination);
                } else {
                    setCurrentRoom('randomRoom');
                }
                break;
            case 'forward':
            default:
                const forwardDestination = availableRooms[currentRoom]?.exits?.forward;
                if (forwardDestination) {
                    setCurrentRoom(forwardDestination);
                } else {
                    if (currentRoom === 'corridor1') {
                        setCurrentRoom('corridor2');
                    } else if (currentRoom === 'corridor2') {
                        setCurrentRoom('corridor3');
                    } else if (currentRoom === 'exit') {

                    } else {
                        setCurrentRoom('corridor1');
                    }
                }
                break;
        }
    };
    const getBackgroundImage = () => {
        if (currentRoom.startsWith('corridor') ||
            ['corridor1', 'corridor2', 'corridor3'].includes(currentBackground)) {
            return '/images/backgrounds/corridor1.jpg';
        }

        const roomNumber = currentBackground?.match(/\d+/)?.[0] || '1';
        return `/images/backgrounds/room${roomNumber}.png`;
    };
    if (gameOver) {
        return <GameOver />;
    }
    if (gameWon) {
        return <GameWin />;
    }
    return (
        <div className="font-sans min-h-screen w-full relative flex flex-col">
            <div className="absolute inset-0 z-0">
                <Image
                    src={getBackgroundImage()}
                    alt="Hospital room"
                    fill
                    style={{objectFit: 'cover'}}
                    priority
                />
            </div>

            <div className="relative z-10 flex flex-col h-screen">
                <div className="flex justify-end items-start p-4">
                    <div className="flex flex-col items-end">
                        <button
                            className="mt-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
                            onClick={() => setShowInventory(!showInventory)}
                        >
                            Inventaire ({inventory.length})
                        </button>
                    </div>
                </div>

                {showInventory && (
                    <div
                        className="absolute top-24 right-4 z-30 bg-black/80 backdrop-blur-sm border border-white/20 p-4 rounded-lg text-white">
                        <h3 className="font-bold text-lg mb-2">Inventaire</h3>
                        {inventory.length === 0 ? (
                            <p className="text-gray-400">Votre inventaire est vide</p>
                        ) : (
                            <ul className="list-disc pl-5">
                                {inventory.map((item, index) => (
                                    <li key={index} className="mb-1">{item}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
                {eventAnimationActive && lastEvent && (
                    <div className="absolute top-1/3 left-0 right-0 z-30 flex justify-center">
                        <div
                            className="bg-red-900/70 backdrop-blur-md border border-red-700 p-4 rounded-lg text-white animate-pulse max-w-md">
                            <h3 className="font-bold text-lg mb-2 text-red-400">{lastEvent.name}</h3>
                            <p>{lastEvent.description}</p>
                        </div>
                    </div>
                )}

                {showPopup && popupMessage && (
                    <div
                        className="absolute top-1/2 left-0 right-0 z-50 flex justify-center transform -translate-y-1/2">
                        <div
                            className="bg-blue-900/90 backdrop-blur-md border border-blue-700 p-6 rounded-lg text-white max-w-md animate-bounce-once shadow-xl">
                            <h3 className="font-bold text-xl mb-2 text-blue-300">Résultat</h3>
                            <p className="text-lg">{popupMessage}</p>
                        </div>
                    </div>
                )}

                <ServiceHeader
                    key={`service-header-${forceUpdate}-${currentRoom}`}
                    serviceName={currentService ? currentService.name : null}
                    serviceDescription={currentService ? currentService.description : null}
                    isCorridor={currentRoom && currentRoom.startsWith('corridor')}
                />
                <div className="flex-grow flex items-center justify-center">
                    {showDoctor && showDoctorDialogue && (
                        <DoctorNPC
                            message={doctorMessage}
                            onMessageEnd={() => {
                                setShowDoctorDialogue(false);
                                if (dialogues.length === 0) {
                                    if (currentRoom && !currentRoom.startsWith('corridor')) {
                                        setShowDoctorChoice(true);
                                        setShowNavigation(false);
                                    } else {
                                        setShowNavigation(true);
                                    }
                                } else {
                                    setDialogueStep(0);
                                }
                            }}
                        />
                    )}
                </div>
                <div className="p-6 pt-8 pb-10 bg-black/60 backdrop-blur-md">
                    {gameStarted && (
                        <div className="flex flex-col gap-8 max-w-6xl mx-auto">
                            {!showDoctorDialogue && dialogueStep < dialogues.length && (
                                <PlayerCharacter
                                    playerNumber={playerNumber}
                                    message={dialogues[dialogueStep]}
                                    onMessageEnd={handleNextDialogue}
                                />
                            )}

                            {showNavigation && currentRoom && currentRoom.startsWith('corridor') && (
                                <div className="mt-8">
                                    <NavigationButtons onNavigate={handleNavigate}/>
                                </div>
                            )}

                            {showDoctorChoice && (
                                <div className="flex justify-center gap-6 mt-8">
                                    <button
                                        onClick={() => handleDoctorChoice('trust')}
                                        className="px-8 py-4 bg-green-700 hover:bg-green-600 text-white rounded-lg shadow-lg font-bold transition-all"
                                    >
                                        Faire confiance
                                    </button>
                                    <button
                                        onClick={() => handleDoctorChoice('denounce')}
                                        className="px-8 py-4 bg-red-700 hover:bg-red-600 text-white rounded-lg shadow-lg font-bold transition-all"
                                    >
                                        Dénoncer
                                    </button>
                                </div>
                            )}

                            {itemAvailable && showNavigation && currentRoom && currentRoom.startsWith('corridor') && (
                                <div className="mt-4 flex justify-center">
                                    <button
                                        onClick={handlePickupItem}
                                        className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg transition-colors"
                                    >
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
                <button
                    onClick={() => router.push('/')}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 transition-colors rounded text-sm text-white"
                >
                    Quitter
                </button>

                <div className="mt-1">
                    <HealthBar initialHealth={health} label="Santé" color="red"/>
                </div>

                <div className="px-3 py-1 bg-yellow-700 rounded text-sm text-white">
                    Illuminatis touvés: {cluesFound}
                </div>

                <div className="px-3 py-1 bg-red-900 border border-red-500 rounded text-sm text-white font-bold">
                    Erreurs Maboule: {mabouleErrorCount}
                </div>
            </div>
        </div>
    );
}