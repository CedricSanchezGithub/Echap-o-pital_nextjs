"use client";

// Liste des symptômes possibles pour le joueur
export const symptoms = [
  {
    id: 1,
    name: "Toux sanglante",
    description: "Je n'arrête pas de tousser du sang depuis ce matin...",
    severity: "high"
  },
  {
    id: 2,
    name: "Mal de tête",
    description: "Ma tête me fait horriblement mal, comme si quelque chose frappait de l'intérieur...",
    severity: "medium"
  },
  {
    id: 3,
    name: "Douleur au bras",
    description: "Mon bras gauche est engourdi et douloureux, je n'arrive plus à le bouger correctement.",
    severity: "medium"
  },
  {
    id: 4,
    name: "Nausées",
    description: "J'ai des nausées terribles et des vertiges depuis que je me suis réveillé(e).",
    severity: "low"
  },
  {
    id: 5,
    name: "Fièvre",
    description: "J'ai une forte fièvre, je suis brûlant(e) et je transpire énormément.",
    severity: "medium"
  },
  {
    id: 6,
    name: "Démangeaisons",
    description: "Ma peau me démange atrocement, comme si des insectes rampaient sous ma peau...",
    severity: "low"
  },
  {
    id: 7,
    name: "Saignements de nez",
    description: "Mon nez n'arrête pas de saigner, c'est inquiétant, je n'ai jamais eu ça avant.",
    severity: "medium"
  },
  {
    id: 8,
    name: "Trouble de la vision",
    description: "Ma vision devient floue par moments et je vois parfois des formes étranges...",
    severity: "high"
  },
  {
    id: 9,
    name: "Douleur thoracique",
    description: "J'ai une douleur horrible dans la poitrine, comme si mon cœur allait exploser.",
    severity: "high"
  }
];

// Fonction pour obtenir un symptôme aléatoire
export function getRandomSymptom() {
  const randomIndex = Math.floor(Math.random() * symptoms.length);
  return symptoms[randomIndex];
}

// Fonction pour obtenir un nombre aléatoire entre min et max
export function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fonction pour obtenir un nombre aléatoire de joueur (1 à 3)
export function getRandomPlayer() {
  return getRandomNumber(1, 3);
}
