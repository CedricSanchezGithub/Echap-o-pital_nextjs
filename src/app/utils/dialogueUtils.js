"use client";

// Liste des phrases possibles des médecins
export const doctorPhrases = [
  {
    id: 1,
    text: "Bonjour, vous ne devriez pas être ici. Les patients doivent rester dans leur chambre.",
    type: "neutral"
  },
  {
    id: 2,
    text: "Je suis au milieu d'une procédure très délicate. Veuillez sortir immédiatement.",
    type: "dismissive"
  },
  {
    id: 3,
    text: "Vous semblez malade... Très malade. Je pense que vous avez besoin d'un traitement spécial.",
    type: "suspicious"
  },
  {
    id: 4,
    text: "Ah, vous voilà. Je vous cherchais. Nous avons... des tests à faire sur vous.",
    type: "suspicious"
  },
  {
    id: 5,
    text: "Est-ce que vous avez pris vos médicaments aujourd'hui ? Ils sont essentiels pour... votre guérison.",
    type: "suspicious"
  },
  {
    id: 6,
    text: "Je viens de terminer ma garde. Je n'ai rien vu d'anormal ici, non, rien du tout...",
    type: "nervous"
  },
  {
    id: 7,
    text: "Vous ne semblez pas avoir de rendez-vous. Comment êtes-vous entré dans cette section?",
    type: "neutral"
  },
  {
    id: 8,
    text: "Je dois préparer la salle pour la prochaine phase. Notre Grand Maître attend des résultats.",
    type: "revealing"
  },
  {
    id: 9,
    text: "Attention où vous mettez les pieds. Certains patients ont... disparu dans ces couloirs.",
    type: "warning"
  },
  {
    id: 10,
    text: "Les nouveaux protocoles sont stricts. Personne ne doit quitter l'hôpital avant d'avoir été... traité.",
    type: "revealing"
  }
];

// Fonction pour obtenir une phrase aléatoire de médecin
export function getRandomDoctorPhrase() {
  const randomIndex = Math.floor(Math.random() * doctorPhrases.length);
  return doctorPhrases[randomIndex];
}

// Fonction pour obtenir une phrase de médecin liée à un service spécifique
export function getServiceSpecificPhrase(serviceId) {
  const serviceSpecificPhrases = {
    cardiology: "Les battements de votre cœur sont irréguliers. Nous devrions faire quelques tests supplémentaires.",
    pneumology: "Votre respiration est laborieuse. Nos nouveaux traitements expérimentaux pourraient vous aider...",
    surgery: "Nous avons une salle d'opération prête pour vous. Ne vous inquiétez pas, vous ne sentirez rien du tout.",
    radiology: "Nos machines révèlent des choses que vous ne pouvez pas voir. Des choses... intéressantes.",
    neurology: "Votre cerveau présente une activité fascinante. Nous aimerions l'étudier de plus près.",
    psychiatry: "Vos hallucinations sont normales. Tout le monde voit des choses étranges dans cet hôpital.",
    emergency: "Restez calme. Votre cas est grave, mais nous avons une solution... définitive.",
    laboratory: "Vos échantillons sont très prometteurs pour notre projet. Merci de votre contribution involontaire.",
    pediatrics: "Les enfants guérissent si vite. Ils sont parfaits pour nos tests."
  };
  
  return serviceSpecificPhrases[serviceId] || getRandomDoctorPhrase().text;
}
