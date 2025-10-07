"use client";

// Liste des services médicaux pour les salles
export const medicalServices = [
  {
    id: "cardiology",
    name: "Cardiologie",
    description: "Service spécialisé dans les maladies du cœur et des vaisseaux sanguins.",
    ambiance: "Les battements de cœur résonnent dans les murs. Certains ne semblent pas humains...",
    difficulty: 1,
    possibleItems: ["seringue", "stéthoscope"]
  },
  {
    id: "pneumology",
    name: "Pneumologie",
    description: "Service spécialisé dans les maladies respiratoires et pulmonaires.",
    ambiance: "L'air est lourd et difficile à respirer. Des bruits de sifflement proviennent des conduits d'aération.",
    difficulty: 1,
    possibleItems: ["masque à oxygène", "inhalateur"]
  },
  {
    id: "surgery",
    name: "Chirurgie",
    description: "Service où sont pratiquées les interventions chirurgicales.",
    ambiance: "Des instruments chirurgicaux sont disposés avec une précision inquiétante. Certains semblent avoir été récemment utilisés.",
    difficulty: 2,
    possibleItems: ["scalpel", "pince chirurgicale", "badge d'accès"]
  },
  {
    id: "radiology",
    name: "Radiologie",
    description: "Service d'imagerie médicale pour le diagnostic.",
    ambiance: "Les écrans montrent des images étranges qui ne correspondent à aucune anatomie humaine connue.",
    difficulty: 2,
    possibleItems: ["plaque de radiographie", "dosimètre"]
  },
  {
    id: "neurology",
    name: "Neurologie",
    description: "Service spécialisé dans les troubles du système nerveux.",
    ambiance: "Des schémas cérébraux sur les murs semblent annotés de symboles ésotériques. Un électroencéphalogramme tourne en continu.",
    difficulty: 3,
    possibleItems: ["électrodes", "notes du Dr. Mørk", "clé de laboratoire"]
  },
  {
    id: "psychiatry",
    name: "Psychiatrie",
    description: "Service traitant les troubles mentaux et du comportement.",
    ambiance: "Les murs capitonnés sont couverts d'inscriptions. Certaines mentionnent un 'Œil qui voit tout'.",
    difficulty: 3,
    possibleItems: ["dossier patient confidentiel", "médicaments expérimentaux", "enregistrement audio"]
  },
  {
    id: "emergency",
    name: "Urgences",
    description: "Service de prise en charge des cas médicaux urgents.",
    ambiance: "Le service est étrangement vide. Des traces de sang mènent à une porte verrouillée.",
    difficulty: 2,
    possibleItems: ["trousse de premiers soins", "carte d'accès"]
  },
  {
    id: "laboratory",
    name: "Laboratoire",
    description: "Service d'analyses médicales et biologiques.",
    ambiance: "Des échantillons non identifiés bouillonnent dans des tubes à essai. Une substance noire pulse dans un contenant scellé.",
    difficulty: 3,
    possibleItems: ["échantillon étrange", "journal de recherche", "code de sécurité"]
  },
  {
    id: "pediatrics",
    name: "Pédiatrie",
    description: "Service spécialisé dans les soins aux enfants.",
    ambiance: "Des dessins d'enfants sur les murs montrent tous la même figure triangulaire. Les jouets semblent se déplacer quand vous ne les regardez pas.",
    difficulty: 1,
    possibleItems: ["peluche inquiétante", "dessin codé"]
  }
];

// Fonction pour obtenir un service médical aléatoire
export function getRandomService(difficultyLevel = 0) {
  // Si un niveau de difficulté est spécifié, filtrer les services par difficulté
  let availableServices = medicalServices;
  
  if (difficultyLevel > 0) {
    availableServices = medicalServices.filter(service => service.difficulty <= difficultyLevel);
  }
  
  const randomIndex = Math.floor(Math.random() * availableServices.length);
  return availableServices[randomIndex];
}

// Fonction pour obtenir un item aléatoire basé sur le service
export function getRandomItem(serviceId) {
  const service = medicalServices.find(s => s.id === serviceId);
  if (!service || !service.possibleItems || service.possibleItems.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * service.possibleItems.length);
  return service.possibleItems[randomIndex];
}

// Structure des données des salles
export const rooms = {
  corridor1: {
    id: "corridor1",
    name: "Couloir Principal",
    type: "corridor",
    description: "Un long couloir faiblement éclairé avec des portes de chaque côté.",
    ambiance: "L'air est froid et humide. Une odeur d'antiseptique plane dans l'air.",
    difficultyLevel: 1,
    exits: {
      left: "randomRoom", // Sera généré dynamiquement
      forward: "corridor2",
      right: "randomRoom" // Sera généré dynamiquement
    },
    eventChance: 0.2 // 20% de chance qu'un événement aléatoire se produise
  },
  corridor2: {
    id: "corridor2",
    name: "Couloir d'Hôpital",
    type: "corridor",
    description: "Le couloir continue, des lumières clignotent au plafond.",
    ambiance: "Un grincement métallique résonne au loin. Des chuchotements semblent provenir des murs.",
    difficultyLevel: 2,
    exits: {
      left: "randomRoom", // Sera généré dynamiquement
      forward: "corridor3",
      right: "randomRoom" // Sera généré dynamiquement
    },
    eventChance: 0.35 // 35% de chance qu'un événement aléatoire se produise
  },
  corridor3: {
    id: "corridor3",
    name: "Couloir des Services",
    type: "corridor",
    description: "Les murs sont couverts d'affiches médicales délavées.",
    ambiance: "Une alarme silencieuse clignote. Des symboles triangulaires ont été dessinés au sol, formant un chemin.",
    difficultyLevel: 3,
    exits: {
      left: "randomRoom", // Sera généré dynamiquement
      forward: "exit", // Potentielle sortie
      right: "randomRoom" // Sera généré dynamiquement
    },
    eventChance: 0.5 // 50% de chance qu'un événement aléatoire se produise
  },
  exit: {
    id: "exit",
    name: "Sortie de l'Hôpital",
    type: "special",
    description: "Une porte métallique lourde avec un symbole d'issue de secours.",
    ambiance: "Un vent frais s'engouffre sous la porte. La liberté semble proche, mais est-ce vraiment une sortie?",
    difficultyLevel: 3,
    exits: {
      left: "corridor3",
      forward: "final", // Mène à la fin du jeu ou à un boss final
      right: "secretRoom" // Une salle secrète potentielle
    },
    locked: true, // La porte est verrouillée et nécessite une clé ou un code
    requiredItems: ["carte d'accès", "code de sécurité"]
  },
  secretRoom: {
    id: "secretRoom",
    name: "Salle de Contrôle",
    type: "special",
    description: "Une salle cachée remplie d'écrans de surveillance et d'équipements sophistiqués.",
    ambiance: "Les écrans montrent toutes les salles de l'hôpital. Au centre, un symbole illuminati géant est gravé dans le sol.",
    difficultyLevel: 3,
    exits: {
      left: "exit",
      forward: null, // Pas de sortie
      right: null  // Pas de sortie
    },
    locked: true,
    requiredItems: ["badge d'accès", "journal de recherche"],
    revealsTruth: true // Cette salle révèle la vérité sur l'hôpital et les Illuminati
  }
};

// Événements aléatoires qui peuvent se produire dans les couloirs
export const randomEvents = [
  {
    id: "lightFlicker",
    name: "Lumières vacillantes",
    description: "Les lumières du couloir vacillent soudainement, plongeant brièvement le couloir dans l'obscurité.",
    effect: "fear", // Effet de peur, peut réduire la santé mentale
    severity: 1
  },
  {
    id: "whispers",
    name: "Chuchotements",
    description: "Vous entendez des chuchotements indistincts qui semblent vous suivre.",
    effect: "fear",
    severity: 1
  },
  {
    id: "bloodTrail",
    name: "Trace de sang",
    description: "Une trace de sang fraîche apparaît soudainement sur le sol, menant vers une direction inconnue.",
    effect: "clue", // Peut donner un indice
    severity: 2
  },
  {
    id: "shadowFigure",
    name: "Silhouette",
    description: "Une silhouette sombre traverse rapidement le couloir devant vous avant de disparaître.",
    effect: "fear",
    severity: 2
  },
  {
    id: "fallingEquipment",
    name: "Équipement qui tombe",
    description: "Un équipement médical tombe bruyamment d'une étagère proche, vous faisant sursauter.",
    effect: "damage", // Peut causer des dommages si le joueur ne réagit pas assez vite
    severity: 1
  },
  {
    id: "strangeSymbol",
    name: "Symbole étrange",
    description: "Un symbole illuminati brille brièvement sur le mur avant de disparaître.",
    effect: "clue",
    severity: 2
  },
  {
    id: "doorSlam",
    name: "Porte qui claque",
    description: "Une porte proche claque violemment sans raison apparente.",
    effect: "fear",
    severity: 1
  },
  {
    id: "brokenGlass",
    name: "Verre brisé",
    description: "Le son de verre brisé résonne dans le couloir, mais vous ne voyez pas d'où il provient.",
    effect: "damage",
    severity: 1
  },
  {
    id: "patientSighting",
    name: "Patient errant",
    description: "Un patient en blouse d'hôpital vous fixe au bout du couloir avant de tourner et disparaître.",
    effect: "clue",
    severity: 3
  }
];
