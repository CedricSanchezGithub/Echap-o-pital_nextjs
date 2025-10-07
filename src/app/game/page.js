"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

// Composants du jeu
import Timer from '../components/Timer';
import HealthBar from '../components/HealthBar';
import PlayerCharacter from '../components/PlayerCharacter';
import NavigationButtons from '../components/NavigationButtons';
import DoctorNPC from '../components/DoctorNPC';
import ServiceHeader from '../components/ServiceHeader';

// Context du jeu
import { useGameContext } from '../context/GameContext';
// Utils
import { rooms, randomEvents } from '../utils/roomUtils';

export default function GamePage() {
  const router = useRouter();
    // États du jeu depuis le contexte
  const { 
    health, 
    sanity,
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
    cluesFound
  } = useGameContext();
    // États locaux de la page
  const [gameStarted, setGameStarted] = useState(false);
  const [dialogueStep, setDialogueStep] = useState(0);
  const [showNavigation, setShowNavigation] = useState(false);
  const [doctorDialogueStep, setDoctorDialogueStep] = useState(0);
  const [showDoctorDialogue, setShowDoctorDialogue] = useState(false);  // États pour la gestion des items et événements
  const [showInventory, setShowInventory] = useState(false);
  const [showItemPrompt, setShowItemPrompt] = useState(false);
  const [eventAnimationActive, setEventAnimationActive] = useState(false);
  
  // Initialiser le jeu
  useEffect(() => {
    // Démarrer le jeu avec un court délai
    const timer = setTimeout(() => {
      setGameStarted(true);
      // On commence dans un couloir sans médecin
      setShowDoctorDialogue(false);
      // Navigation buttons will appear after dialogue completes
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Effet pour animer l'apparition des événements aléatoires
  useEffect(() => {
    if (lastEvent) {
      setEventAnimationActive(true);
      const timer = setTimeout(() => {
        setEventAnimationActive(false);
      }, 4000); // Animation de 4 secondes
      
      return () => clearTimeout(timer);
    }
  }, [lastEvent]);// Dialogue initial du joueur
  const initialDialogues = [
    "Bonjour ? Il y a quelqu'un ? Je ne me sens pas très bien...",
    playerSymptom ? playerSymptom.description : "Je me sens vraiment mal...",
    "J'ai besoin de voir un médecin rapidement. Cet hôpital semble... étrange.",
    "Je devrais chercher de l'aide. Mais où aller ?"
  ];
  
  // Dialogues spécifiques aux services médicaux
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
  
  // Déterminer quels dialogues afficher en fonction de la salle courante
  const dialogues = currentService ? 
    serviceDialogues[currentService.id] || initialDialogues : 
    initialDialogues;
    // Reset dialogue states when room changes
  useEffect(() => {
    setDialogueStep(0);
    setDoctorDialogueStep(0);
    
    // If we're in a medical service room, show the doctor
    if (showDoctor) {
      setShowDoctorDialogue(true);
      setShowNavigation(false);
    } else {
      setShowDoctorDialogue(false);
      // In corridors, we'll show navigation buttons after completing the dialogue
      // (this is handled separately in handleNextDialogue)
    }
  }, [currentRoom, showDoctor]);
  
  // Show navigation buttons when the player dialogue completes
  useEffect(() => {
    // If we're not in a room with a doctor and player dialogue is finished, show navigation
    if (!showDoctorDialogue && dialogueStep >= dialogues.length - 1) {
      setShowNavigation(true);
    }
  }, [dialogueStep, dialogues.length, showDoctorDialogue]);
  
    // Gérer la progression du dialogue du joueur
  const handleNextDialogue = () => {
    if (dialogueStep < dialogues.length - 1) {
      setDialogueStep(dialogueStep + 1);
    } else {
      // Quand tous les dialogues sont terminés, afficher les options de navigation
      setShowNavigation(true);
    }
  };  // Gérer la progression du dialogue du médecin
  const handleDoctorDialogue = () => {
    if (doctorDialogueStep < 1) {  // Changed from 0 to 1 to allow multiple dialogue steps
      setDoctorDialogueStep(doctorDialogueStep + 1);
    } else {
      // Quand le dialogue du médecin est terminé, montrer les options de navigation
      setShowDoctorDialogue(false);
      setShowNavigation(true);
    }
  };  // Gérer le ramassage d'un item
  const handlePickupItem = () => {
    if (itemAvailable) {
      if (pickupItem(itemAvailable)) {
        setShowItemPrompt(false);
      }
    }
  };
  
  // Gérer la navigation
  const handleNavigation = (direction) => {
    // Masquer les boutons de navigation pendant la transition
    setShowNavigation(false);
    setShowItemPrompt(false);
    
    // Navigation logic based on direction and current room
    switch (direction) {
      case 'left':
      case 'right':
        // Pour les portes de gauche et droite
        const currentRoomData = availableRooms[currentRoom] || {};
        const destination = currentRoomData.exits && currentRoomData.exits[direction];
        
        if (destination) {
          setCurrentRoom(destination);
        } else {
          // Si pas de destination spécifique, aller dans une salle médicale aléatoire
          setCurrentRoom('randomRoom'); // Génère une salle aléatoire (room1 à room9) avec médecin
        }
        break;
      case 'forward':
      default:
        // Pour continuer tout droit
        const forwardDestination = availableRooms[currentRoom]?.exits?.forward;
        
        if (forwardDestination) {
          setCurrentRoom(forwardDestination);
        } else {
          // Progression par défaut entre les couloirs
          if (currentRoom === 'corridor1') {
            setCurrentRoom('corridor2'); // Will use corridor1.jpg image
          } else if (currentRoom === 'corridor2') {
            setCurrentRoom('corridor3'); // Will use corridor1.jpg image
          } else if (currentRoom === 'exit') {
            // Fin du jeu si on sort
            // À implémenter: écran de victoire
          } else {
            setCurrentRoom('corridor1'); // Will use corridor1.jpg image
          }
        }
        break;
    }
  };
  
  return (
    <div className="font-sans min-h-screen w-full relative flex flex-col">
      {/* Fond de la salle courante */}      <div className="absolute inset-0 z-0">        <Image 
          src={(() => {
            // Si c'est un couloir, utiliser corridor1.jpg
            if (currentRoom.startsWith('corridor') || 
                currentBackground === 'corridor1' || 
                currentBackground === 'corridor2' || 
                currentBackground === 'corridor3') {
              return `/images/backgrounds/corridor1.jpg`;
            }
            
            // Si c'est une salle médicale, extraire le numéro de la salle
            let roomNumber = '1'; // Par défaut room1
            if (currentBackground && currentBackground.includes('room')) {
              const matches = currentBackground.match(/\d+/);
              if (matches && matches.length > 0) {
                roomNumber = matches[0];
              }
            }
            
            // Retourner le chemin correct vers l'image
            return `/images/backgrounds/room${roomNumber}.png`;
          })()}
          alt="Hospital room"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
      
      {/* UI du jeu */}
      <div className="relative z-10 flex flex-col h-screen">      {/* Barre supérieure avec timer */}
        <div className="flex justify-end items-start p-4">
          <div className="flex flex-col items-end">
            <Timer initialTime={3600} />
            <button 
              className="mt-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
              onClick={() => setShowInventory(!showInventory)}
            >
              Inventaire ({inventory.length})
            </button>
          </div>
        </div>
        
        {/* Popup d'inventaire */}
        {showInventory && (
          <div className="absolute top-24 right-4 z-30 bg-black/80 backdrop-blur-sm border border-white/20 p-4 rounded-lg text-white">
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
        
        {/* Animation d'événement aléatoire */}
        {eventAnimationActive && lastEvent && (
          <div className="absolute top-1/3 left-0 right-0 z-30 flex justify-center">
            <div className="bg-red-900/70 backdrop-blur-md border border-red-700 p-4 rounded-lg text-white animate-pulse max-w-md">
              <h3 className="font-bold text-lg mb-2 text-red-400">{lastEvent.name}</h3>
              <p>{lastEvent.description}</p>
            </div>
          </div>
        )}
        
        {/* En-tête du service médical (quand on est dans un service) */}
        {currentService && (
          <ServiceHeader serviceName={currentService.name} />
        )}
          {/* Zone principale de jeu (centre) */}
        <div className="flex-grow flex items-center justify-center">
          {/* Afficher le médecin quand on est dans une salle de service */}
          {showDoctor && showDoctorDialogue && (            <DoctorNPC 
              message={doctorMessage} 
              onMessageEnd={() => {
                // When doctor dialogue ends, transition to player dialogue or navigation
                setShowDoctorDialogue(false);
                if (dialogues.length === 0) {
                  // If no player dialogue for this room, show navigation
                  setShowNavigation(true);
                } else {
                  // Otherwise, start player dialogue
                  setDialogueStep(0);
                }
              }} 
            />
          )}
        </div>
          {/* Barre inférieure avec le joueur et les dialogues/choix */}
        <div className="p-6 pt-8 pb-10 bg-black/60 backdrop-blur-md">          {gameStarted && (
            <div className="flex flex-col gap-8 max-w-6xl mx-auto">              {/* N'afficher le personnage du joueur que si on n'est pas en dialogue avec un docteur */}
              {!showDoctorDialogue && dialogueStep < dialogues.length && (
                <PlayerCharacter 
                  playerNumber={playerNumber} 
                  message={dialogues[dialogueStep]} 
                  onMessageEnd={handleNextDialogue}
                />
              )}
                    {/* Boutons de navigation (apparaissent après les dialogues) */}
              {showNavigation && (
                <div className="mt-8">
                  <NavigationButtons onNavigate={handleNavigation} />
                </div>
              )}
              
              {/* Prompt de ramassage d'item */}
              {itemAvailable && showNavigation && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={handlePickupItem}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    Ramasser: {itemAvailable}
                  </button>
                </div>
              )}
              
              {/* Ambiance de la salle */}
              {currentRoomAmbiance && showNavigation && (
                <div className="mt-4 text-gray-300 italic text-sm max-w-2xl mx-auto text-center">
                  <p>{currentRoomAmbiance}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
        {/* Boutons d'interface */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
        <button 
          onClick={() => router.push('/')}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 transition-colors rounded text-sm text-white"
        >
          Quitter
        </button>
        
        {/* Barre de santé */}
        <div className="mt-1">
          <HealthBar initialHealth={health} label="Santé" color="red" />
        </div>
        
        {/* Compteur d'indices trouvés */}
        <div className="px-3 py-1 bg-yellow-700 rounded text-sm text-white">
          Indices: {cluesFound}
        </div>
      </div>
    </div>
  );
}
