"use client";

import {createContext, useState, useContext, useEffect} from 'react';
import {getRandomSymptom, getRandomPlayer} from '../utils/gameUtils';
import {getRandomService, getRandomItem, rooms, randomEvents} from '../utils/roomUtils';
import {generateStory} from '../services/api';
import {handleDoctorChoice as handleDoctorChoiceService} from '../services/doctorService';

const GameContext = createContext();

const HEALTH_PENALTY_PER_ERROR = 15;
const INITIAL_HEALTH = 100;

export function GameProvider({children}) {
    const [gameWon, setGameWon] = useState(false);
    const [health, setHealth] = useState(INITIAL_HEALTH);
    const [currentRoom, setCurrentRoom] = useState('corridor1');
    const [inventory, setInventory] = useState([]);
    const [playerNumber, setPlayerNumber] = useState(1);
    const [playerSymptom, setPlayerSymptom] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [visitedRooms, setVisitedRooms] = useState(['corridor1']);
    const [cluesFound, setCluesFound] = useState(0);
    const [lastEvent, setLastEvent] = useState(null);
    const [sanity, setSanity] = useState(100);
    const [difficultyProgression, setDifficultyProgression] = useState(1);
    const [showDoctorChoice, setShowDoctorChoice] = useState(false);
    const [popupMessage, setPopupMessage] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    const [currentBackground, setCurrentBackground] = useState('corridor1');
    const [showDoctor, setShowDoctor] = useState(false);
    const [doctorMessage, setDoctorMessage] = useState('');
    const [doctorChoices, setDoctorChoices] = useState([]);
    const [isDialogueFinal, setIsDialogueFinal] = useState(false);
    const [generatedRooms, setGeneratedRooms] = useState({});
    const [currentRoomAmbiance, setCurrentRoomAmbiance] = useState('');
    const [itemAvailable, setItemAvailable] = useState(null);
    const [mabouleErrorCount, setMabouleErrorCount] = useState(0);

    useEffect(() => {
        if (health <= 0 && !gameOver) {
            setGameOver(true);
        }
    }, [health, gameOver]);

    useEffect(() => {
        if (cluesFound >= 5) {
            setGameWon(true);
        }
    }, [cluesFound]);

    useEffect(() => {
        setPlayerNumber(getRandomPlayer());
        setPlayerSymptom(getRandomSymptom());
    }, []);

    useEffect(() => {
        const apiUrl = "http://localhost:8081/api";
        const eventSource = new EventSource(`${apiUrl}/maboule/events`);

        const handleMabouleUpdate = (event) => {
            const data = JSON.parse(event.data);
            setMabouleErrorCount(data.totalErrors);

            const totalPenalty = data.totalErrors * HEALTH_PENALTY_PER_ERROR;
            const newHealth = Math.max(0, INITIAL_HEALTH - totalPenalty);
            setHealth(newHealth);

            if (event.type === 'error-event') {
                setPopupMessage(`Docteur Maboule : Erreur n°${data.totalErrors} ! Votre santé diminue.`);
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 3000);
            }
        };

        eventSource.onopen = () => console.log("SSE Connection to backend established.");
        eventSource.addEventListener('state-update', handleMabouleUpdate);
        eventSource.addEventListener('error-event', handleMabouleUpdate);
        eventSource.onerror = (err) => {
            console.error("EventSource failed:", err);
            eventSource.close();
        };

        return () => {
            console.log("Closing SSE connection.");
            eventSource.close();
        };
    }, []);

    const addToInventory = (item) => {
        setInventory((prev) => [...prev, item]);
    };

    const decreaseHealth = (amount) => {
        setHealth((prev) => Math.max(0, prev - amount));
    };

    const increaseHealth = (amount) => {
        setHealth((prev) => Math.min(INITIAL_HEALTH, prev + amount));
    };

    const handleDoctorChoice = (choice) => {
        const gameActions = {
            setPopupMessage, setCluesFound, increaseHealth, decreaseHealth,
            setPlayerSymptom, setShowPopup, setShowDoctorChoice, setCurrentRoom,
            visitedRooms, getRandomSymptom
        };
        handleDoctorChoiceService(choice, generatedRooms[currentRoom], gameActions);
    };

    const continueStory = async (choiceId) => {
        setShowDoctorChoice(false);
        // LA MODIFICATION EST ICI
        const storyData = await generateStory({ choiceId: choiceId });

        setDoctorMessage(storyData.dialogue);
        setDoctorChoices(storyData.choix);
        setIsDialogueFinal(storyData.fin_dialogue);
        setShowDoctor(true);
    };

    const generateRandomRoom = async () => {
        const difficultyLevel = visitedRooms.includes('corridor3') ? 3 :
            visitedRooms.includes('corridor2') ? 2 : 1;

        let service = getRandomService(difficultyLevel);
        if (!service?.name) {
            service = { id: 'general', name: 'Médecine Générale', description: '...', ambiance: '...', difficulty: 1 };
        }

        const roomNumber = Math.floor(Math.random() * 9) + 1;
        const background = `room${roomNumber}`;
        const roomId = `${service.id}_${background}`;

        if (!generatedRooms[roomId]) {
            const storyData = await generateStory({
                symptome: playerSymptom?.name || 'inconnu',
                salle: service.name || 'inconnue',
                etat: health > 50 ? 'stable' : 'faible'
            });

            const newRoom = {
                id: roomId, service, background,
                doctorMessage: storyData.dialogue,
                doctorChoices: storyData.choix,
                isDialogueFinal: storyData.fin_dialogue,
                ambiance: service.ambiance || "La salle est silencieuse et inquiétante.",
                item: Math.random() < 0.4 ? getRandomItem(service.id) : null,
                isBad: Math.random() < 0.5
            };
            setGeneratedRooms(prev => ({...prev, [roomId]: newRoom}));
            return newRoom;
        }

        return generatedRooms[roomId];
    };

    const handleRandomEvent = (corridor) => {
        if (!corridor || !rooms[corridor]?.eventChance) return null;
        if (Math.random() <= rooms[corridor].eventChance) {
            const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
            switch (event.effect) {
                case 'fear':
                    decreaseHealth(event.severity * 2);
                    break;
                case 'damage':
                    decreaseHealth(event.severity * 3);
                    break;
                case 'clue':
                    findClue();
                    break;
                default:
                    break;
            }
            return event;
        }
        return null;
    };

    const changeRoom = async (roomId) => {
        let actualRoomId = roomId;
        let generatedRoom = null;

        if (roomId === 'randomRoom') {
            generatedRoom = await generateRandomRoom();
            actualRoomId = generatedRoom.id;
        }

        if (rooms[actualRoomId]?.locked) {
            const requiredItems = rooms[actualRoomId].requiredItems || [];
            if (!requiredItems.every(item => inventory.includes(item))) {
                setDoctorMessage("Cette porte est verrouillée. Vous avez besoin d'un accès spécial pour entrer.");
                setShowDoctor(true);
                return;
            }
        }

        setCurrentRoom(actualRoomId);

        const room = generatedRoom || generatedRooms[actualRoomId];
        if (room) {
            setCurrentService(room.service);
            setCurrentBackground(room.background);
            setShowDoctor(true);
            setDoctorMessage(room.doctorMessage);
            setDoctorChoices(room.doctorChoices || []);
            setIsDialogueFinal(room.isDialogueFinal || false);
            setCurrentRoomAmbiance(room.ambiance || room.service?.ambiance || "");
            if (room.item && !inventory.includes(room.item)) {
                setItemAvailable(room.item);
            } else {
                setItemAvailable(null);
            }
            if (room.difficulty > difficultyProgression) {
                setDifficultyProgression(room.difficulty);
            }
        } else if (actualRoomId.startsWith('corridor')) {
            const corridorData = rooms[actualRoomId];
            setCurrentService(null);
            setCurrentBackground('corridor1');
            setCurrentRoomAmbiance(corridorData?.ambiance || "");
            setShowDoctor(false);
            setDoctorMessage('');
            setDoctorChoices([]);
            setItemAvailable(null);
            const event = handleRandomEvent(actualRoomId);
            if (event) {
                setDoctorMessage(event.description);
                setShowDoctor(true);
                setLastEvent(event);
            } else {
                setLastEvent(null);
            }
        } else if (actualRoomId === 'exit' || actualRoomId === 'secretRoom') {
            const specialRoom = rooms[actualRoomId];
            setCurrentService({id: actualRoomId, name: specialRoom.name, description: specialRoom.description});
            setCurrentBackground('room9');
            setCurrentRoomAmbiance(specialRoom.ambiance || "");
            setShowDoctor(true);
            setItemAvailable(null);
            setDoctorChoices([]);
            const message = actualRoomId === 'secretRoom' && specialRoom.revealsTruth
                ? "Vous avez découvert la salle secrète de l'hôpital. Des documents révèlent que cet établissement est en réalité un centre d'expérimentation contrôlé par les Illuminati. Leur symbole est partout."
                : specialRoom.ambiance || "Cette salle semble importante.";
            setDoctorMessage(message);
            if (actualRoomId === 'secretRoom' && specialRoom.revealsTruth) {
                setCluesFound(prev => prev + 3);
            }
        } else {
            setCurrentService(null);
            setCurrentBackground(actualRoomId);
            setShowDoctor(false);
            setDoctorMessage('');
        }

        if (!visitedRooms.includes(actualRoomId)) {
            setVisitedRooms(prev => [...prev, actualRoomId]);
        }
    };

    const findClue = () => {
        setCluesFound((prev) => prev + 1);
    };

    const pickupItem = (item) => {
        if (item && !inventory.includes(item)) {
            addToInventory(item);
            if (generatedRooms[currentRoom]?.item === item) {
                setGeneratedRooms(prev => ({
                    ...prev,
                    [currentRoom]: {...prev[currentRoom], item: null, itemPickedUp: true}
                }));
            }
            setItemAvailable(null);
            return true;
        }
        return false;
    };

    const decreaseSanity = (amount) => {
        setSanity((prev) => {
            const newSanity = Math.max(0, prev - amount);
            if (newSanity === 0) {
                setGameOver(true);
            }
            return newSanity;
        });
    };

    const value = {
        health, setHealth, sanity, setSanity, decreaseSanity,
        currentRoom, setCurrentRoom: changeRoom, inventory, addToInventory, pickupItem,
        playerNumber, playerSymptom, decreaseHealth, increaseHealth, gameOver, setGameOver,
        visitedRooms, cluesFound, findClue, currentService, currentBackground, currentRoomAmbiance,
        showDoctor, doctorMessage, setDoctorMessage, generatedRooms, generateRandomRoom, lastEvent,
        difficultyProgression, itemAvailable, showDoctorChoice, setShowDoctorChoice,
        handleDoctorChoice, popupMessage, showPopup, availableRooms: rooms, mabouleErrorCount,
        gameWon,
        doctorChoices,
        continueStory,
        isDialogueFinal
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;

}

export function useGameContext() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGameContext must be used within a GameProvider');
    }
    return context;
}