document.addEventListener('DOMContentLoaded', () => {
    const historyList = document.getElementById('historyList');
    const emotionSummary = document.getElementById('emotionSummary');
    const clearButton = document.getElementById('clearHistory');

    function loadHistory() {
        const historyData = JSON.parse(localStorage.getItem('emotion-history')) || [];
        renderHistory(historyData);
        renderEmotionSummary(historyData);
    }

    function renderEmotionSummary(historyData) {
        if (historyData.length === 0) {
            emotionSummary.innerHTML = '<p class="text-gray-600">No hay datos suficientes para mostrar un resumen.</p>';
            return;
        }

        // Contar frecuencia de emociones
        const emotionCount = {};
        historyData.forEach(entry => {
            emotionCount[entry.emotion] = (emotionCount[entry.emotion] || 0) + 1;
        });

        // Encontrar la emoción más frecuente
        const mostFrequent = Object.entries(emotionCount)
            .sort((a, b) => b[1] - a[1])[0];

        // Calcular porcentajes
        const total = historyData.length;
        const percentages = Object.entries(emotionCount)
            .map(([emotion, count]) => ({
                emotion,
                count,
                percentage: ((count / total) * 100).toFixed(1)
            }))
            .sort((a, b) => b.count - a.count);

        // Renderizar resumen
        emotionSummary.innerHTML = `
            <div class="mb-4">
                <p class="font-semibold">Emoción más frecuente:</p>
                <p class="text-lg">${mostFrequent[0]} (${mostFrequent[1]} veces)</p>
            </div>
            <div>
                <p class="font-semibold mb-2">Distribución de emociones:</p>
                ${percentages.map(({ emotion, count, percentage }) => `
                    <div class="mb-2">
                        <div class="flex justify-between mb-1">
                            <span>${emotion}</span>
                            <span>${percentage}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-green-500 h-2 rounded-full" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderHistory(historyData) {
        if (historyData.length === 0) {
            historyList.innerHTML = '<p class="text-center text-gray-600">No hay emociones registradas aún.</p>';
            return;
        }

        // Ordenar por fecha más reciente
        const sortedData = [...historyData].sort((a, b) => new Date(b.date) - new Date(a.date));

        historyList.innerHTML = `
            <div class="space-y-4">
                ${sortedData.map(entry => `
                    <div class="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-sm text-gray-600">${formatDate(entry.date)}</p>
                                <p class="font-semibold text-lg">${entry.emotion}</p>
                                <p class="text-gray-700">Intensidad: ${entry.intensity}</p>
                                ${entry.symptoms ? `
                                    <p class="text-gray-700 mt-2">
                                        <span class="font-semibold">Síntomas:</span> ${entry.symptoms.join(', ')}
                                    </p>
                                ` : ''}
                                ${entry.notes ? `
                                    <p class="text-gray-700 mt-2">
                                        <span class="font-semibold">Notas:</span> ${entry.notes}
                                    </p>
                                ` : ''}
                            </div>
                            <button 
                                class="text-red-500 hover:text-red-700" 
                                onclick="deleteEntry('${entry.date}')"
                                title="Eliminar registro">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function deleteEntry(date) {
        if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
            const historyData = JSON.parse(localStorage.getItem('emotion-history')) || [];
            const updatedHistory = historyData.filter(entry => entry.date !== date);
            localStorage.setItem('emotion-history', JSON.stringify(updatedHistory));
            loadHistory();
        }
    }

    // Event Listeners
    clearButton.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas borrar todo el historial? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('emotion-history');
            loadHistory();
        }
    });

    // Exponer la función deleteEntry globalmente
    window.deleteEntry = deleteEntry;

    // Cargar historial inicial
    loadHistory();
});
