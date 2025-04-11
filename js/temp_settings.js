// Configuración de Komorebi
document.addEventListener('DOMContentLoaded', () => {
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

    function updateColors(primaryColor, secondaryColor) {
        // Actualizar elementos de la interfaz
        document.querySelectorAll('.bg-green-500').forEach(el => {
            el.style.backgroundColor = primaryColor;
        });

        document.querySelectorAll('.hover\\:bg-green-600').forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.style.backgroundColor = adjustColor(primaryColor, -20);
            });
            el.addEventListener('mouseleave', () => {
                el.style.backgroundColor = primaryColor;
            });
        });

        // Actualizar estilos CSS personalizados
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --primary-color: ${primaryColor};
                --secondary-color: ${secondaryColor};
            }
            .bg-green-500 { background-color: var(--primary-color) !important; }
            .hover\\:bg-green-600:hover { background-color: ${adjustColor(primaryColor, -20)} !important; }
            .focus\\:border-green-500:focus { border-color: var(--primary-color) !important; }
            .focus\\:ring-green-200:focus { box-shadow: 0 0 0 3px ${adjustColor(primaryColor, 80, true)} !important; }
        `;
        
        const oldStyle = document.getElementById('komorebi-theme');
        if (oldStyle) oldStyle.remove();
        style.id = 'komorebi-theme';
        document.head.appendChild(style);
    }

    function adjustColor(color, amount, alpha = false) {
        const hex = color.replace('#', '');
        const num = parseInt(hex, 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + amount));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
        const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
        return alpha ? `rgba(${r},${g},${b},0.2)` : '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function loadSettings() {
        const saved = JSON.parse(localStorage.getItem('komorebi-settings')) || defaultSettings;
        primaryColorInput.value = saved.theme.primaryColor;
        secondaryColorInput.value = saved.theme.secondaryColor;
        enableNotificationsCheckbox.checked = saved.notifications.enabled;
        notificationTime.value = saved.notifications.time;
        notificationFrequency.value = saved.notifications.frequency;
        notificationSettings.style.display = saved.notifications.enabled ? 'block' : 'none';
        updateColors(saved.theme.primaryColor, saved.theme.secondaryColor);
    }

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
        updateColors(settings.theme.primaryColor, settings.theme.secondaryColor);
        showNotification('Configuración guardada exitosamente');
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Event Listeners
    primaryColorInput.addEventListener('input', () => updateColors(primaryColorInput.value, secondaryColorInput.value));
    secondaryColorInput.addEventListener('input', () => updateColors(primaryColorInput.value, secondaryColorInput.value));
    enableNotificationsCheckbox.addEventListener('change', e => {
        notificationSettings.style.display = e.target.checked ? 'block' : 'none';
    });
    saveButton.addEventListener('click', saveSettings);
    resetButton.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas restablecer todas las configuraciones?')) {
            localStorage.removeItem('komorebi-settings');
            loadSettings();
        }
    });

    // Inicializar
    loadSettings();
});
