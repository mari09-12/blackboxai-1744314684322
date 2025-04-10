document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const primaryColorInput = document.getElementById('primaryColor');
    const secondaryColorInput = document.getElementById('secondaryColor');
    const enableNotificationsCheckbox = document.getElementById('enableNotifications');
    const notificationSettings = document.getElementById('notificationSettings');
    const notificationTime = document.getElementById('notificationTime');
    const notificationFrequency = document.getElementById('notificationFrequency');
    const saveButton = document.getElementById('saveSettings');
    const resetButton = document.getElementById('resetSettings');
    const previewHeader = document.querySelector('.preview-header');
    const previewButton = document.querySelector('.preview-button');

    // Valores por defecto
    const defaultSettings = {
        theme: {
            primaryColor: '#22c55e',
            secondaryColor: '#3b82f6'
        },
        notifications: {
            enabled: false,
            time: '09:00',
            frequency: 'daily'
        }
    };

    // Cargar configuraciones guardadas
    function loadSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('komorebi-settings')) || defaultSettings;
        
        // Aplicar tema
        primaryColorInput.value = savedSettings.theme.primaryColor;
        secondaryColorInput.value = savedSettings.theme.secondaryColor;
        updatePreview();

        // Aplicar configuración de notificaciones
        enableNotificationsCheckbox.checked = savedSettings.notifications.enabled;
        notificationTime.value = savedSettings.notifications.time;
        notificationFrequency.value = savedSettings.notifications.frequency;
        notificationSettings.style.display = savedSettings.notifications.enabled ? 'block' : 'none';
    }

    // Actualizar previsualización
    function updatePreview() {
        previewHeader.style.backgroundColor = primaryColorInput.value;
        previewButton.style.backgroundColor = primaryColorInput.value;
    }

    // Guardar configuraciones
    function saveSettings() {
        const settings = {
            theme: {
                primaryColor: primaryColorInput.value,
                secondaryColor: secondaryColorInput.value
            },
            notifications: {
                enabled: enableNotificationsCheckbox.checked,
                time: notificationTime.value,
                frequency: notificationFrequency.value
            }
        };

        localStorage.setItem('komorebi-settings', JSON.stringify(settings));
        applySettings(settings);
        showSaveConfirmation();
    }

    // Aplicar configuraciones
    function applySettings(settings) {
        // Aplicar tema globalmente
        document.documentElement.style.setProperty('--primary-color', settings.theme.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', settings.theme.secondaryColor);

        // Configurar notificaciones
        if (settings.notifications.enabled) {
            requestNotificationPermission();
            scheduleNotifications(settings.notifications);
        }
    }

    // Solicitar permiso para notificaciones
    async function requestNotificationPermission() {
        if (!("Notification" in window)) {
            alert("Este navegador no soporta notificaciones de escritorio");
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                alert("Necesitamos permisos para enviar notificaciones");
                enableNotificationsCheckbox.checked = false;
            }
        } catch (error) {
            console.error("Error al solicitar permisos de notificación:", error);
            enableNotificationsCheckbox.checked = false;
        }
    }

    // Programar notificaciones
    function scheduleNotifications(notificationSettings) {
        if (!notificationSettings.enabled) return;

        const [hours, minutes] = notificationSettings.time.split(':');
        const now = new Date();
        let nextNotification = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 
                                     parseInt(hours), parseInt(minutes));

        if (nextNotification < now) {
            nextNotification.setDate(nextNotification.getDate() + 1);
        }

        const timeUntilNotification = nextNotification - now;

        setTimeout(() => {
            showNotification();
            // Reprogramar para el siguiente día
            scheduleNotifications(notificationSettings);
        }, timeUntilNotification);
    }

    // Mostrar notificación
    function showNotification() {
        if (Notification.permission === "granted") {
            new Notification("Komorebi - Registro de Emociones", {
                body: "¡Es hora de registrar cómo te sientes!",
                icon: "/assets/icon.png" // Asegúrate de tener un ícono
            });
        }
    }

    // Mostrar confirmación de guardado
    function showSaveConfirmation() {
        const confirmation = document.createElement('div');
        confirmation.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
        confirmation.textContent = 'Configuración guardada exitosamente';
        document.body.appendChild(confirmation);

        setTimeout(() => {
            confirmation.remove();
        }, 3000);
    }

    // Event Listeners
    primaryColorInput.addEventListener('input', updatePreview);
    secondaryColorInput.addEventListener('input', updatePreview);

    enableNotificationsCheckbox.addEventListener('change', (e) => {
        notificationSettings.style.display = e.target.checked ? 'block' : 'none';
        if (e.target.checked) {
            requestNotificationPermission();
        }
    });

    saveButton.addEventListener('click', saveSettings);

    resetButton.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas restablecer todas las configuraciones?')) {
            localStorage.removeItem('komorebi-settings');
            loadSettings();
        }
    });

    // Inicializar configuraciones
    loadSettings();
});
