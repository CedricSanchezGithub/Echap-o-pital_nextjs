const API_BASE_URL = "http://localhost:8081/api";

export const generateStory = async (symptome, salle, etat) => {
    try {
        const response = await fetch(`${API_BASE_URL}/story/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ symptome, salle, etat }),
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        return await response.text();

    } catch (error) {
        console.error('Failed to fetch story:', error);
        return "Le médecin vous regarde étrangement... Il semble avoir perdu le fil de ses pensées.";
    }
};