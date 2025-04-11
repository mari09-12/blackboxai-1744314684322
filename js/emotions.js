document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('emotionForm');
    const emotionButtons = document.querySelectorAll('.emotion-btn');
    const selectedEmotionInput = document.getElementById('selectedEmotion');
    const intensityInput = document.getElementById('intensity');
    
    // Manejar selección de emoción
    emotionButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover selección previa
            emotionButtons.forEach(btn => {
                btn.classList.remove('bg-green-100', 'border-green-500');
            });
            
            // Marcar el botón seleccionado
            button.classList.add('bg-green-100', 'border-green-500');
            selectedEmotionInput.value = button.dataset.emotion;
        });
    });

    // Manejar envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validar que se haya seleccionado una emoción
        if (!selectedEmotionInput.value) {
            alert('Por favor, selecciona una emoción');
            return;
        }

        // Recopilar datos del formulario
        const dateTime = document.getElementById('dateTime').value;
        const emotion = selectedEmotionInput.value;
        const intensity = intensityInput.value;
        const notes = document.getElementById('notes').value;

        // Recopilar síntomas seleccionados
        const selectedSymptoms = Array.from(document.querySelectorAll('input[name="symptoms"]:checked'))
            .map(checkbox => checkbox.value);

        // Crear entrada para el historial
        const entry = {
            date: dateTime,
            emotion: emotion,
            intensity: intensity,
            symptoms: selectedSymptoms,
            notes: notes
        };

        // Guardar en el historial
        const history = JSON.parse(localStorage.getItem('emotion-history')) || [];
        history.push(entry);
        localStorage.setItem('emotion-history', JSON.stringify(history));

        // Obtener herramientas personalizadas basadas en la emoción y síntomas
        try {
            const response = await fetch('data/tools.json');
            const data = await response.json();
            const allTools = data.tools;

            // Mapeo de emociones a categorías de herramientas
            const emotionToolMap = {
                'feliz': ['gratitud', 'mindfulness'],
                'triste': ['motivacion', 'mindfulness'],
                'enojado': ['relajacion', 'mindfulness'],
                'tranquilo': ['mindfulness'],
                'ansiedad': ['relajacion', 'mindfulness'],
                'frustracion': ['motivacion', 'mindfulness'],
                'verguenza': ['autoestima', 'mindfulness'],
                'culpa': ['perdon', 'mindfulness'],
                'desconfianza': ['autoestima', 'mindfulness'],
                'aburrimiento': ['creatividad', 'motivacion'],
                'satisfaccion': ['gratitud', 'mindfulness'],
                'odio': ['perdon', 'compasion'],
                'melancolia': ['gratitud', 'mindfulness']
            };

            // Obtener categorías relevantes para la emoción
            const relevantCategories = emotionToolMap[emotion] || ['mindfulness'];

            // Filtrar herramientas relevantes
            let relevantTools = allTools.filter(tool => 
                relevantCategories.includes(tool.category)
            );

            // Si hay síntomas, priorizar herramientas relacionadas
            if (selectedSymptoms.length > 0) {
                relevantTools = relevantTools.sort((a, b) => {
                    const aHasSymptomRelation = a.tags?.some(tag => 
                        selectedSymptoms.some(symptom => tag.includes(symptom))
                    ) || false;
                    const bHasSymptomRelation = b.tags?.some(tag => 
                        selectedSymptoms.some(symptom => tag.includes(symptom))
                    ) || false;
                    return bHasSymptomRelation - aHasSymptomRelation;
                });
            }

            // Tomar las 3 primeras herramientas
            const recommendedTools = relevantTools.slice(0, 3);

            // Mostrar mensaje de éxito y recomendaciones
            showSuccessMessage(recommendedTools);
        } catch (error) {
            console.error('Error al cargar las herramientas:', error);
            showSuccessMessage([]);
        }
    });

    function showSuccessMessage(recommendedTools) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-lg w-full">
                <h3 class="text-xl font-semibold mb-4">¡Registro guardado exitosamente!</h3>
                
                <div class="mb-4">
                    ${recommendedTools.length > 0 ? `
                        <p class="text-gray-600 mb-2">Basado en tu registro, te recomendamos:</p>
                        <ul class="space-y-2">
                            ${recommendedTools.map(tool => `
                                <li class="flex items-center space-x-2">
                                    <i class="fas fa-check-circle text-green-500"></i>
                                    <span>${tool.name}</span>
                                </li>
                            `).join('')}
                        </ul>
                    ` : ''}
                </div>

                <div class="flex justify-end space-x-2">
                    <button class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onclick="window.location.reload()">
                        Nuevo registro
                    </button>
                    <button class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" onclick="window.location.href='tools.html'">
                        Ver herramientas
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                window.location.reload();
            }
        });
    }

    // Establecer fecha y hora actual por defecto
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('dateTime').value = now.toISOString().slice(0, 16);
});
