"use client";

import { createContext, useState, useContext, useEffect } from 'react';
import { getRandomSymptom, getRandomPlayer } from '../utils/gameUtils';
import { getRandomService, getRandomItem, rooms, randomEvents } from '../utils/roomUtils';
import { getServiceSpecificPhrase } from '../utils/dialogueUtils';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [health, setHealth] = useState(100);
  const [timeLeft, setTimeLeft] = useState(3600);
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
  const [generatedRooms, setGeneratedRooms] = useState({});
  const [currentRoomAmbiance, setCurrentRoomAmbiance] = useState('');
  const [itemAvailable, setItemAvailable] = useState(null);
  
  useEffect(() => {
    setPlayerNumber(getRandomPlayer());
    setPlayerSymptom(getRandomSymptom());
  }, []);
  
  const addToInventory = (item) => {
    setInventory((prev) => [...prev, item]);
  };

  const decreaseHealth = (amount) => {
    setHealth((prev) => {
      const newHealth = Math.max(0, prev - amount);      if (newHealth === 0) {
        setGameOver(true);
      }
      return newHealth;
    });
  };
  
  const increaseHealth = (amount) => {
    setHealth((prev) => Math.min(100, prev + amount));
  };
    const handleDoctorChoice = (choice) => {
    const currentRoomData = generatedRooms[currentRoom];
    
    if (!currentRoomData || currentRoomData.isBad === undefined) return;
    
    if (currentRoomData.isBad && choice === 'denounce') {
      setPopupMessage("Félicitation, vous avez capturé un Illuminati !");
      setCluesFound(prev => prev + 1);
    } else if (!currentRoomData.isBad && choice === 'trust') {
      setPopupMessage("Le médecin vous a soigné ! Vous récupérez des points de vie.");
      increaseHealth(15);
      setPlayerSymptom(getRandomSymptom());
    } else {
      setPopupMessage("Mauvaise réponse ! Le médecin vous a blessé.");
      decreaseHealth(10);
    }
    
    setShowPopup(true);
    setShowDoctorChoice(false);
    
    setTimeout(() => {
      setShowPopup(false);
      const corridorToReturn = visitedRooms.includes('corridor3') ? 'corridor3' :
                              visitedRooms.includes('corridor2') ? 'corridor2' : 'corridor1';
      setCurrentRoom(corridorToReturn);
    }, 3000);
  };  const generateRandomRoom = () => {
    const difficultyLevel = visitedRooms.includes('corridor3') ? 3 :
                           visitedRooms.includes('corridor2') ? 2 : 1;
    
    let service = getRandomService(difficultyLevel);
    
    if (!service?.name) {
      service = {
        id: 'general',
        name: 'Médecine Générale',
        description: 'Service de médecine générale',
        ambiance: 'Une salle médicale standard.',
        difficulty: 1
      };
    }
    
    const roomNumber = Math.floor(Math.random() * 9) + 1;
    const background = `room${roomNumber}`;
    const roomId = `${service.id}_${background}`;
    
    if (!generatedRooms[roomId]) {
      const newRoom = {
        id: roomId,
        service: {
          id: service.id,
          name: service.name,
          description: service.description || 'Service hospitalier spécialisé',
          ambiance: service.ambiance || "La salle est silencieuse et inquiétante.",
          difficulty: service.difficulty || 1
        },
        background,
        doctorMessage: getServiceSpecificPhrase(service.id),
        difficulty: service.difficulty || 1,
        ambiance: service.ambiance || "La salle est silencieuse et inquiétante.",
        item: Math.random() < 0.4 ? getRandomItem(service.id) : null,
        isBad: Math.random() < 0.5
      };
      
      setGeneratedRooms(prev => ({ ...prev, [roomId]: newRoom }));
      return newRoom;
    }
    
    return generatedRooms[roomId];
  };  const handleRandomEvent = (corridor) => {
    if (!corridor || !rooms[corridor]?.eventChance) return null;
    
    if (Math.random() <= rooms[corridor].eventChance) {
      const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      
      switch(event.effect) {
        case 'fear':
          decreaseHealth(event.severity * 2);
          break;
        case 'damage':
          decreaseHealth(event.severity * 3);
          break;
        case 'clue':
          findClue();
          break;
      }
      
      return event;
    }
    
    return null;
  };  const changeRoom = (roomId) => {
    let actualRoomId = roomId;
    let generatedRoom = null;
    
    if (roomId === 'randomRoom') {
      generatedRoom = generateRandomRoom();
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
      setCurrentRoomAmbiance(room.ambiance || room.service?.ambiance || "");
      
      if (room.item && !inventory.includes(room.item)) {
        setItemAvailable(room.item);
        setDoctorMessage(prev => `${prev} *Vous remarquez un objet intéressant: un ${room.item}.*`);
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
      setCurrentService({
        id: actualRoomId,
        name: specialRoom.name,
        description: specialRoom.description
      });
      setCurrentBackground('room9');
      setCurrentRoomAmbiance(specialRoom.ambiance || "");
      setShowDoctor(true);
      setItemAvailable(null);
      
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
          [currentRoom]: {
            ...prev[currentRoom],
            item: null,
            itemPickedUp: true
          }
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
  };  const value = {
    health,
    setHealth,
    sanity,
    setSanity,
    decreaseSanity,
    timeLeft,
    setTimeLeft,
    currentRoom,
    setCurrentRoom: changeRoom,
    inventory,
    addToInventory,
    pickupItem,
    playerNumber,
    playerSymptom,
    decreaseHealth,
    increaseHealth,
    gameOver,
    setGameOver,
    visitedRooms,
    cluesFound,
    findClue,
    currentService,
    currentBackground,
    currentRoomAmbiance,
    showDoctor,
    doctorMessage,
    setDoctorMessage,
    generatedRooms,
    generateRandomRoom,
    lastEvent,
    difficultyProgression,
    itemAvailable,
    showDoctorChoice,
    setShowDoctorChoice,
    handleDoctorChoice,
    popupMessage,
    showPopup,
    availableRooms: rooms
  };  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
