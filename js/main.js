// Función para cargar las preferencias de tema
function loadThemePreferences() {
    const savedTheme = localStorage.getItem('komorebi-theme');
    if (savedTheme) {
        const theme = JSON.parse(savedTheme);
        document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
        
        // Actualizar elementos del DOM con los colores guardados
        const header = document.querySelector('header');
        if (header) {
            header.style.backgroundColor = theme.primaryColor;
        }

        const buttons = document.querySelectorAll('.bg-green-500');
        buttons.forEach(button => {
            button.style.backgroundColor = theme.primaryColor;
        });
    }
}

// Función para verificar y configurar notificaciones
function setupNotifications() {
    const notificationSettings = localStorage.getItem('komorebi-notifications');
    if (notificationSettings) {
        const settings = JSON.parse(notificationSettings);
        if (settings.enabled) {
            requestNotificationPermission();
        }
    }
}

// Solicitar permiso para notificaciones
async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.log("Este navegador no soporta notificaciones");
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            console.log("Permiso de notificaciones concedido");
        }
    } catch (error) {
        console.error("Error al solicitar permiso de notificaciones:", error);
    }
}

// Función para mostrar notificaciones
function showNotification(title, body) {
    if (Notification.permission === "granted") {
        new Notification(title, {
            body: body,
            icon: '/assets/icon.png' // Asegúrate de tener un ícono
        });
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    loadThemePreferences();
    setupNotifications();

    // Verificar si hay un recordatorio programado para registrar emociones
    const lastCheck = localStorage.getItem('last-emotion-check');
    const now = new Date();
    if (!lastCheck || (now - new Date(lastCheck)) > 24 * 60 * 60 * 1000) {
        showNotification(
            "Komorebi - Registro de Emociones",
            "¡Recuerda registrar cómo te sientes hoy!"
        );
        localStorage.setItem('last-emotion-check', now.toISOString());
    }
});

// Manejar errores de manera global
window.addEventListener('error', (event) => {
    console.error('Error global:', event.error);
    // Aquí podrías implementar un sistema de registro de errores más sofisticado
});

// Exportar funciones para uso en otros módulos
window.komorebiApp = {
    showNotification,
    loadThemePreferences
};
