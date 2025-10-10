const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api";

export const generateStory = async (storyData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/story/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(storyData),
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok, status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Données reçues du backend :", data);
        return data;

    } catch (error) {
        console.error('Failed to fetch story:', error);
        return {
            dialogue: "Le médecin vous regarde étrangement... Il semble avoir perdu le fil de ses pensées.",
            choix: [{ id: "continuer", texte: "Ignorer et continuer" }],
            fin_dialogue: true
        };
    }
};