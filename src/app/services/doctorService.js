export const handleDoctorChoice = (choice, roomData, gameActions) => {
    const {
        setPopupMessage,
        setCluesFound,
        increaseHealth,
        decreaseHealth,
        setPlayerSymptom,
        setShowPopup,
        setShowDoctorChoice,
        setCurrentRoom,
        visitedRooms,
        getRandomSymptom
    } = gameActions;

    if (!roomData || roomData.isBad === undefined) return;

    if (roomData.isBad && choice === 'denounce') {
        setPopupMessage("Félicitation, vous avez capturé un Illuminati !");
        setCluesFound(prev => prev + 1);
    } else if (!roomData.isBad && choice === 'trust') {
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
};