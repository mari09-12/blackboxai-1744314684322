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
        const primaryColor = primaryColorInput.value;
        const secondaryColor = secondaryColorInput.value;

        // Actualizar elementos de previsualización
        if (previewHeader) {
            previewHeader.style.backgroundColor = primaryColor;
        }
        if (previewButton) {
            previewButton.style.backgroundColor = primaryColor;
        }

        // Actualizar elementos globales
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--secondary-color', secondaryColor);

        // Actualizar header y botones en tiempo real
        document.querySelectorAll('.bg-green-500').forEach(el => {
            el.style.backgroundColor = primaryColor;
        });

        // Actualizar efectos hover
        document.querySelectorAll('.hover\\:bg-green-600').forEach(button => {
            const originalColor = primaryColor;
            button.addEventListener('mouseenter', () => {
                button.style.backgroundColor = adjustColor(originalColor, -20);
            });
            button.addEventListener('mouseleave', () => {
                button.style.backgroundColor = originalColor;
            });
        });
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
        
        // Actualizar elementos con las nuevas clases de color
        const headers = document.querySelectorAll('header');
        headers.forEach(header => {
            header.style.backgroundColor = settings.theme.primaryColor;
        });

        const buttons = document.querySelectorAll('.bg-green-500, .hover\\:bg-green-600');
        buttons.forEach(button => {
            button.style.backgroundColor = settings.theme.primaryColor;
            button.addEventListener('mouseover', () => {
                button.style.backgroundColor = adjustColor(settings.theme.primaryColor, -10);
            });
            button.addEventListener('mouseout', () => {
                button.style.backgroundColor = settings.theme.primaryColor;
            });
        });

        // Actualizar focus rings y bordes
        const focusElements = document.querySelectorAll('.focus\\:border-green-500, .focus\\:ring-green-200');
        focusElements.forEach(element => {
            element.style.setProperty('--tw-ring-color', settings.theme.primaryColor + '33');
            element.style.setProperty('--tw-ring-offset-color', settings.theme.primaryColor);
        });

        // Configurar notificaciones
        if (settings.notifications.enabled) {
            requestNotificationPermission();
            scheduleNotifications(settings.notifications);
        }
    }

    // Función auxiliar para ajustar el color (oscurecer/aclarar)
    function adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const num = parseInt(hex, 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + amount));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
        const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
        return '#' + (b | (g << 8) | (r << 16)).toString(16).padStart(6, '0');
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
