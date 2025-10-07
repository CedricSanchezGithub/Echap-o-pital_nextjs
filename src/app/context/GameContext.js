"use client";

import { createContext, useState, useContext, useEffect } from 'react';
import { getRandomSymptom, getRandomPlayer } from '../utils/gameUtils';
import { getRandomService, getRandomItem, rooms, randomEvents } from '../utils/roomUtils';
import { getRandomDoctorPhrase, getServiceSpecificPhrase } from '../utils/dialogueUtils';

// Création du contexte
const GameContext = createContext();

// Fournisseur du contexte
export function GameProvider({ children }) {  // État global du jeu
  const [health, setHealth] = useState(100);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [currentRoom, setCurrentRoom] = useState('corridor1');
  const [inventory, setInventory] = useState([]);
  const [playerNumber, setPlayerNumber] = useState(1);
  const [playerSymptom, setPlayerSymptom] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [visitedRooms, setVisitedRooms] = useState(['corridor1']);
  const [cluesFound, setCluesFound] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);
  const [sanity, setSanity] = useState(100); // Santé mentale séparée de la santé physique
  const [difficultyProgression, setDifficultyProgression] = useState(1); // Niveau de difficulté actuel
  
  // États spécifiques aux salles
  const [currentService, setCurrentService] = useState(null);
  const [currentBackground, setCurrentBackground] = useState('corridor1');
  const [showDoctor, setShowDoctor] = useState(false);
  const [doctorMessage, setDoctorMessage] = useState('');
  const [generatedRooms, setGeneratedRooms] = useState({});
  const [currentRoomAmbiance, setCurrentRoomAmbiance] = useState('');
  const [itemAvailable, setItemAvailable] = useState(null);
  
  // Initialiser le joueur et son symptôme
  useEffect(() => {
    setPlayerNumber(getRandomPlayer());
    setPlayerSymptom(getRandomSymptom());
  }, []);
  
  // Fonction pour ajouter un objet à l'inventaire
  const addToInventory = (item) => {
    setInventory((prev) => [...prev, item]);
  };
  
  // Fonction pour retirer de la vie
  const decreaseHealth = (amount) => {
    setHealth((prev) => {
      const newHealth = Math.max(0, prev - amount);
      if (newHealth === 0) {
        setGameOver(true);
      }
      return newHealth;
    });
  };  // Fonction pour générer une salle aléatoire
  const generateRandomRoom = () => {
    // Déterminer le niveau de difficulté en fonction de la progression
    let difficultyLevel = 1;
    if (visitedRooms.includes('corridor2')) difficultyLevel = 2;
    if (visitedRooms.includes('corridor3')) difficultyLevel = 3;
    
    // Choisir un service aléatoire adapté à la difficulté
    const service = getRandomService(difficultyLevel);
    
    // Choisir un fond aléatoire entre room1 et room9 (correspond aux images disponibles dans public/images/backgrounds/)
    const roomNumber = Math.floor(Math.random() * 9) + 1;
    const background = `room${roomNumber}`; // Sera utilisé pour construire le chemin de l'image: /images/backgrounds/roomX.png
    
    // Créer un ID unique pour la salle
    const roomId = `${service.id}_${background}`;
    
    // Créer la salle si elle n'existe pas déjà
    if (!generatedRooms[roomId]) {
      // Générer un message du médecin spécifique au service
      const message = getServiceSpecificPhrase(service.id);
      
      // Vérifier si un item peut être trouvé dans cette salle
      const potentialItem = Math.random() < 0.4 ? getRandomItem(service.id) : null; // 40% de chance de trouver un item
      
      setGeneratedRooms(prev => ({
        ...prev,
        [roomId]: {
          id: roomId,
          service: service,
          background: background,
          doctorMessage: message,
          difficulty: service.difficulty || 1,
          ambiance: service.ambiance || "La salle est silencieuse et inquiétante.",
          item: potentialItem
        }
      }));
    }
    
    return roomId;
  };
  // Fonction pour gérer des événements aléatoires dans les couloirs
  const handleRandomEvent = (corridor) => {
    if (!corridor || !rooms[corridor] || !rooms[corridor].eventChance) {
      return null;
    }
    
    // Vérifier si un événement se produit selon la chance définie pour le couloir
    if (Math.random() <= rooms[corridor].eventChance) {
      // Sélectionner un événement aléatoire
      const randomIndex = Math.floor(Math.random() * randomEvents.length);
      const event = randomEvents[randomIndex];
      
      // Traiter l'effet de l'événement
      switch(event.effect) {
        case 'fear':
          // Réduire la santé mentale (on utilise health comme santé mentale pour simplifier)
          decreaseHealth(event.severity * 2);
          break;
        case 'damage':
          // Causer des dommages physiques
          decreaseHealth(event.severity * 3);
          break;
        case 'clue':
          // Donner un indice
          findClue();
          break;
        default:
          break;
      }
      
      return event;
    }
    
    return null;
  };

  // Fonction pour changer de salle
  const changeRoom = (roomId) => {
    // Si la salle demandée est "randomRoom", on génère une salle aléatoire
    if (roomId === 'randomRoom') {
      roomId = generateRandomRoom();
    }
    
    // Vérifier si la salle est verrouillée
    if (rooms[roomId] && rooms[roomId].locked) {
      // Vérifier si le joueur a les objets requis
      const requiredItems = rooms[roomId].requiredItems || [];
      const hasAllItems = requiredItems.every(item => inventory.includes(item));
      
      if (!hasAllItems) {
        // Le joueur ne peut pas entrer dans cette salle pour l'instant
        // On affiche un message et on ne change pas de salle
        setDoctorMessage("Cette porte est verrouillée. Vous avez besoin d'un accès spécial pour entrer.");
        setShowDoctor(true);
        return;
      }
    }
    
    setCurrentRoom(roomId);
      // Si c'est une salle générée aléatoirement
    if (generatedRooms[roomId]) {
      const room = generatedRooms[roomId];
      setCurrentService(room.service);
      setCurrentBackground(room.background); // background sera "room1" à "room9" (sans l'extension)
      setShowDoctor(true);
      setDoctorMessage(room.doctorMessage);
      setCurrentRoomAmbiance(room.ambiance || room.service.ambiance);
      
      // Si la salle contient un item et qu'on ne l'a pas encore ramassé
      if (room.item && !inventory.includes(room.item)) {
        // Indiquer qu'il y a un item disponible
        setItemAvailable(room.item);
        // On ajoute l'item à la fin du message du médecin
        setDoctorMessage(prev => `${prev} *Vous remarquez un objet intéressant: un ${room.item}.*`);
      } else {
        setItemAvailable(null);
      }
      
      // Ajuster la difficulté du jeu en fonction de la salle
      if (room.difficulty > difficultyProgression) {
        setDifficultyProgression(room.difficulty);
      }
    } else if (roomId.startsWith('corridor')) {
      // C'est un couloir
      const corridorData = rooms[roomId];
      setCurrentService(null);
      setCurrentBackground('corridor1'); // Always use corridor1.jpg for all corridors
      setCurrentRoomAmbiance(corridorData?.ambiance || "");
      setShowDoctor(false);
      setDoctorMessage('');
      setItemAvailable(null);
      
      // Vérifier si un événement aléatoire se produit
      const event = handleRandomEvent(roomId);
      if (event) {
        // Afficher un message pour l'événement
        setDoctorMessage(event.description);
        setShowDoctor(true);
        setLastEvent(event);
      } else {
        setLastEvent(null);
      }
    } else if (roomId === 'exit' || roomId === 'secretRoom') {
      // Salles spéciales
      const specialRoom = rooms[roomId];
      setCurrentService({
        id: roomId,
        name: specialRoom.name,
        description: specialRoom.description
      });
      setCurrentBackground('room9'); // Utiliser une image de salle spéciale
      setCurrentRoomAmbiance(specialRoom.ambiance || "");
      setShowDoctor(true);
      setItemAvailable(null);
      
      if (roomId === 'secretRoom' && specialRoom.revealsTruth) {
        setDoctorMessage("Vous avez découvert la salle secrète de l'hôpital. Des documents révèlent que cet établissement est en réalité un centre d'expérimentation contrôlé par les Illuminati. Leur symbole est partout.");
        // Ajouter plusieurs indices pour la découverte de cette salle
        setCluesFound(prev => prev + 3);
      } else {
        setDoctorMessage(specialRoom.ambiance || "Cette salle semble importante.");
      }
    } else {
      // Autre type de salle prédéfinie
      setCurrentService(null);
      setCurrentBackground(roomId);
      setShowDoctor(false);
      setDoctorMessage('');
    }
    
    if (!visitedRooms.includes(roomId)) {
      setVisitedRooms((prev) => [...prev, roomId]);
    }
  };
  
  // Fonction pour trouver un indice
  const findClue = () => {
    setCluesFound((prev) => prev + 1);
  };
  // Fonction pour ramasser un objet dans une salle
  const pickupItem = (item) => {
    if (item && !inventory.includes(item)) {
      addToInventory(item);
      
      // Si la salle contient cet objet, marquer l'objet comme ramassé
      if (generatedRooms[currentRoom] && generatedRooms[currentRoom].item === item) {
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

  // Fonction pour gérer la santé mentale
  const decreaseSanity = (amount) => {
    setSanity((prev) => {
      const newSanity = Math.max(0, prev - amount);
      // Si la santé mentale atteint 0, le joueur perd le contrôle
      if (newSanity === 0) {
        setGameOver(true);
      }
      return newSanity;
    });
  };

  // Valeur du contexte à fournir aux composants enfants
  const value = {
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
    gameOver,
    setGameOver,
    visitedRooms,
    cluesFound,
    findClue,
    // Nouveaux états et fonctions
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
    // Accès aux données statiques pour faciliter le référencement
    availableRooms: rooms
  };
  
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Hook personnalisé pour utiliser le contexte
export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
