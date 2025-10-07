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
  const [showDoctorChoice, setShowDoctorChoice] = useState(false); // Affichage des boutons faire confiance/dénoncer
  const [popupMessage, setPopupMessage] = useState(null); // Message à afficher dans la pop-up
  const [showPopup, setShowPopup] = useState(false); // État pour afficher ou masquer la pop-up
  
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
  };
  
  // Fonction pour augmenter la vie
  const increaseHealth = (amount) => {
    setHealth((prev) => {
      return Math.min(100, prev + amount);
    });
  };
  
  // Gérer le choix du joueur face au médecin (faire confiance ou dénoncer)
  const handleDoctorChoice = (choice) => {
    // On récupère les infos sur la salle actuelle
    const currentRoomData = generatedRooms[currentRoom];
    
    // Si pas de données ou pas d'info sur le médecin, ne rien faire
    if (!currentRoomData || currentRoomData.isBad === undefined) return;
    
    // Déterminer si le choix est correct
    let isCorrectChoice = false;
    
    // Si le médecin est un Illuminati (mauvais) et que le joueur le dénonce
    if (currentRoomData.isBad && choice === 'denounce') {
      isCorrectChoice = true;
      setPopupMessage("Félicitation, vous avez capturé un Illuminati !");
      setCluesFound(prev => prev + 1); // Ajouter un indice
    } 
    // Si le médecin est honnête (bon) et que le joueur lui fait confiance
    else if (!currentRoomData.isBad && choice === 'trust') {
      isCorrectChoice = true;
      setPopupMessage("Le médecin vous a soigné ! Vous récupérez des points de vie.");
      increaseHealth(15); // Récupérer de la vie
      // Changer de symptôme car guéri
      setPlayerSymptom(getRandomSymptom());
    }
    // Mauvais choix
    else {
      isCorrectChoice = false;
      setPopupMessage("Mauvaise réponse ! Le médecin vous a blessé.");
      decreaseHealth(10); // Perdre de la vie
    }
    
    setShowPopup(true);
    setShowDoctorChoice(false);
    
    // Après un délai, fermer la popup et retourner au couloir
    setTimeout(() => {
      setShowPopup(false);
      // Retourner au couloir précédent
      let corridorToReturn = 'corridor1';
      if (visitedRooms.includes('corridor3')) {
        corridorToReturn = 'corridor3';
      } else if (visitedRooms.includes('corridor2')) {
        corridorToReturn = 'corridor2';
      }
      setCurrentRoom(corridorToReturn);
    }, 3000);
  };// Fonction pour générer une salle aléatoire
  const generateRandomRoom = () => {
    // Déterminer le niveau de difficulté en fonction de la progression
    let difficultyLevel = 1;
    if (visitedRooms.includes('corridor2')) difficultyLevel = 2;
    if (visitedRooms.includes('corridor3')) difficultyLevel = 3;
      // Choisir un service aléatoire adapté à la difficulté
    let service = getRandomService(difficultyLevel);
    console.log("🔍 Service généré:", service);
    
    // Validation du service
    if (!service || !service.name) {
      console.error("❌ Service invalide généré:", service);
      // Créer un service de fallback
      service = {
        id: 'general',
        name: 'Médecine Générale',
        description: 'Service de médecine générale',
        ambiance: 'Une salle médicale standard.',
        difficulty: 1
      };
      console.log("🛠️ Utilisation du service de fallback:", service);
    }
    
    // Choisir un fond aléatoire entre room1 et room9 (correspond aux images disponibles dans public/images/backgrounds/)
    const roomNumber = Math.floor(Math.random() * 9) + 1;
    const background = `room${roomNumber}`; // Sera utilisé pour construire le chemin de l'image: /images/backgrounds/roomX.png
    
    // Créer un ID unique pour la salle
    const roomId = `${service.id}_${background}`;
    
    // Créer la salle si elle n'existe pas déjà
    if (!generatedRooms[roomId]) {
      // Déterminer si le médecin est un Illuminati (50% de chance)
      const isBad = Math.random() < 0.5;
      
      // Générer un message du médecin spécifique au service
      const message = getServiceSpecificPhrase(service.id);
      
      // Vérifier si un item peut être trouvé dans cette salle
      const potentialItem = Math.random() < 0.4 ? getRandomItem(service.id) : null; // 40% de chance de trouver un item
      
      const newRoom = {
        id: roomId,
        service: {
          id: service.id,
          name: service.name || 'Service Médical',
          description: service.description || 'Service hospitalier spécialisé',
          ambiance: service.ambiance || "La salle est silencieuse et inquiétante.",
          difficulty: service.difficulty || 1
        },
        background: background,
        doctorMessage: message,
        difficulty: service.difficulty || 1,
        ambiance: service.ambiance || "La salle est silencieuse et inquiétante.",
        item: potentialItem,
        isBad: isBad // Le médecin est-il un Illuminati?
      };
      
      console.log("🏥 Nouvelle salle créée:", {
        roomId: newRoom.id,
        serviceName: newRoom.service.name,
        serviceDescription: newRoom.service.description
      });
      
      setGeneratedRooms(prev => ({
        ...prev,
        [roomId]: newRoom
      }));
      
      return newRoom;
    }
    
    // Si la salle existe déjà, la retourner
    console.log("♻️ Salle existante réutilisée:", roomId);
    return generatedRooms[roomId];
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
    console.log("🚪 changeRoom appelé avec:", roomId);
    
    let actualRoomId = roomId;
    let generatedRoom = null;
    
    // Si la salle demandée est "randomRoom", on génère une salle aléatoire
    if (roomId === 'randomRoom') {
      generatedRoom = generateRandomRoom();
      actualRoomId = generatedRoom.id;
      console.log("🎲 Salle aléatoire générée:", actualRoomId);
    }
    
    // Vérifier si la salle est verrouillée
    if (rooms[actualRoomId] && rooms[actualRoomId].locked) {
      // Vérifier si le joueur a les objets requis
      const requiredItems = rooms[actualRoomId].requiredItems || [];
      const hasAllItems = requiredItems.every(item => inventory.includes(item));
      
      if (!hasAllItems) {
        // Le joueur ne peut pas entrer dans cette salle pour l'instant
        // On affiche un message et on ne change pas de salle
        setDoctorMessage("Cette porte est verrouillée. Vous avez besoin d'un accès spécial pour entrer.");
        setShowDoctor(true);
        return;
      }
    }
    
    setCurrentRoom(actualRoomId);
    
    // Si c'est une salle générée aléatoirement
    const room = generatedRoom || generatedRooms[actualRoomId];
    if (room) {
      console.log("🏥 Configuration de la salle générée:", {
        roomId: room.id,
        serviceName: room.service?.name,
        serviceDescription: room.service?.description
      });
      
      setCurrentService(room.service);
      setCurrentBackground(room.background); // background sera "room1" à "room9" (sans l'extension)
      setShowDoctor(true);
      setDoctorMessage(room.doctorMessage);
      setCurrentRoomAmbiance(room.ambiance || room.service?.ambiance || "");
      
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
    } else if (actualRoomId.startsWith('corridor')) {
      // C'est un couloir
      console.log("🚶 Entrée dans le couloir:", actualRoomId);
      const corridorData = rooms[actualRoomId];
      setCurrentService(null);
      setCurrentBackground('corridor1'); // Always use corridor1.jpg for all corridors
      setCurrentRoomAmbiance(corridorData?.ambiance || "");
      setShowDoctor(false);
      setDoctorMessage('');
      setItemAvailable(null);
      
      // Vérifier si un événement aléatoire se produit
      const event = handleRandomEvent(actualRoomId);
      if (event) {
        // Afficher un message pour l'événement
        setDoctorMessage(event.description);
        setShowDoctor(true);
        setLastEvent(event);
      } else {
        setLastEvent(null);
      }
    } else if (actualRoomId === 'exit' || actualRoomId === 'secretRoom') {
      // Salles spéciales
      console.log("🔐 Entrée dans la salle spéciale:", actualRoomId);
      const specialRoom = rooms[actualRoomId];
      setCurrentService({
        id: actualRoomId,
        name: specialRoom.name,
        description: specialRoom.description
      });
      setCurrentBackground('room9'); // Utiliser une image de salle spéciale
      setCurrentRoomAmbiance(specialRoom.ambiance || "");
      setShowDoctor(true);
      setItemAvailable(null);
      
      if (actualRoomId === 'secretRoom' && specialRoom.revealsTruth) {
        setDoctorMessage("Vous avez découvert la salle secrète de l'hôpital. Des documents révèlent que cet établissement est en réalité un centre d'expérimentation contrôlé par les Illuminati. Leur symbole est partout.");
        // Ajouter plusieurs indices pour la découverte de cette salle
        setCluesFound(prev => prev + 3);
      } else {
        setDoctorMessage(specialRoom.ambiance || "Cette salle semble importante.");
      }
    } else {
      // Autre type de salle prédéfinie
      console.log("❓ Type de salle non reconnu:", actualRoomId);
      setCurrentService(null);
      setCurrentBackground(actualRoomId);
      setShowDoctor(false);
      setDoctorMessage('');
    }
    
    if (!visitedRooms.includes(actualRoomId)) {
      setVisitedRooms((prev) => [...prev, actualRoomId]);
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
    increaseHealth,
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
    // États et fonctions pour la mécanique de docteur
    showDoctorChoice,
    setShowDoctorChoice,
    handleDoctorChoice,
    popupMessage,
    showPopup,
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
