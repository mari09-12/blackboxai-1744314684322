document.addEventListener('DOMContentLoaded', () => {
    const historyList = document.getElementById('historyList');
    loadEmotionHistory();

    // Función para cargar el historial de emociones
    function loadEmotionHistory() {
        const emotions = JSON.parse(localStorage.getItem('komorebi-emotions')) || [];
        
        if (emotions.length === 0) {
            historyList.innerHTML = `
                <div class="text-center text-gray-600">
                    <p>No hay emociones registradas aún.</p>
                    <a href="record_emotion.html" class="text-green-500 hover:underline">
                        Registra tu primera emoción
                    </a>
                </div>
            `;
            return;
        }

        // Ordenar emociones por fecha, más recientes primero
        emotions.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

        // Crear elementos para cada emoción
        const emotionElements = emotions.map(emotion => createEmotionCard(emotion));
        
        // Agregar elementos al DOM
        historyList.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${emotionElements.join('')}
            </div>
        `;

        // Agregar eventos para expandir/colapsar notas
        document.querySelectorAll('.expand-notes').forEach(button => {
            button.addEventListener('click', () => {
                const notesElement = button.nextElementSibling;
                notesElement.classList.toggle('hidden');
                button.innerHTML = notesElement.classList.contains('hidden') 
                    ? 'Ver más <i class="fas fa-chevron-down"></i>' 
                    : 'Ver menos <i class="fas fa-chevron-up"></i>';
            });
        });
    }

    // Función para crear una tarjeta de emoción
    function createEmotionCard(emotion) {
        const date = new Date(emotion.dateTime);
        const formattedDate = date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Mapeo de emociones a iconos y colores
        const emotionConfig = {
            feliz: { icon: 'fa-smile', color: 'text-yellow-500', bg: 'bg-yellow-100' },
            triste: { icon: 'fa-sad-tear', color: 'text-blue-500', bg: 'bg-blue-100' },
            enojado: { icon: 'fa-angry', color: 'text-red-500', bg: 'bg-red-100' },
            tranquilo: { icon: 'fa-peace', color: 'text-green-500', bg: 'bg-green-100' }
        };

        const config = emotionConfig[emotion.emotion] || { 
            icon: 'fa-question', 
            color: 'text-gray-500',
            bg: 'bg-gray-100'
        };

        return `
            <div class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                        <i class="fas ${config.icon} text-2xl ${config.color} mr-3"></i>
                        <div>
                            <h3 class="font-semibold capitalize">${emotion.emotion}</h3>
                            <p class="text-sm text-gray-600">${formattedDate}</p>
                        </div>
                    </div>
                    <div class="${config.bg} px-3 py-1 rounded-full">
                        <span class="text-sm">Intensidad: ${emotion.intensity}/10</span>
                    </div>
                </div>
                
                ${emotion.notes ? `
                    <div class="mt-4">
                        <button class="expand-notes text-sm text-green-500 hover:text-green-600 focus:outline-none">
                            Ver más <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="hidden mt-2 text-gray-600 text-sm">
                            ${emotion.notes}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Función para exportar el historial
    window.exportHistory = function() {
        const emotions = JSON.parse(localStorage.getItem('komorebi-emotions')) || [];
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Fecha,Emoción,Intensidad,Notas\n"
            + emotions.map(e => {
                return `${e.dateTime},${e.emotion},${e.intensity},"${e.notes || ''}"`;
            }).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "komorebi-historial-emociones.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
