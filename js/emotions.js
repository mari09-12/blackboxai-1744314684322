// Función para manejar el envío del formulario de emociones
document.addEventListener('DOMContentLoaded', () => {
    const emotionForm = document.getElementById('emotionForm');
    const emotionButtons = document.querySelectorAll('.emotion-btn');

    // Manejar la selección de emociones
    emotionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedEmotion = button.getAttribute('data-emotion');
            document.getElementById('selectedEmotion').value = selectedEmotion;
            emotionButtons.forEach(btn => btn.classList.remove('bg-gray-200'));
            button.classList.add('bg-gray-200');
        });
    });

    // Manejar el envío del formulario
    emotionForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const dateTime = document.getElementById('dateTime').value;
        const selectedEmotion = document.getElementById('selectedEmotion').value;
        const intensity = document.getElementById('intensity').value;
        const notes = document.getElementById('notes').value;

        if (!selectedEmotion) {
            alert("Por favor, selecciona una emoción.");
            return;
        }

        const emotionEntry = {
            dateTime: dateTime,
            emotion: selectedEmotion,
            intensity: intensity,
            notes: notes
        };

        saveEmotion(emotionEntry);
    });
});

// Función para guardar la emoción en localStorage
function saveEmotion(emotionEntry) {
    let emotions = JSON.parse(localStorage.getItem('komorebi-emotions')) || [];
    emotions.push(emotionEntry);
    localStorage.setItem('komorebi-emotions', JSON.stringify(emotions));
    alert("Emoción registrada exitosamente.");
    document.getElementById('emotionForm').reset();
    document.querySelectorAll('.emotion-btn').forEach(btn => btn.classList.remove('bg-gray-200'));
}
