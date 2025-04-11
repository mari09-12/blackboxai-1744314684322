// Cargar y aplicar tema
document.addEventListener('DOMContentLoaded', () => {
    const defaultSettings = {
        theme: {
            primaryColor: '#22c55e',
            secondaryColor: '#3b82f6'
        }
    };

    function adjustColor(color, amount, alpha = false) {
        const hex = color.replace('#', '');
        const num = parseInt(hex, 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + amount));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
        const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
        return alpha ? `rgba(${r},${g},${b},0.2)` : '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function applyTheme(settings) {
        const primaryColor = settings.theme.primaryColor;
        const secondaryColor = settings.theme.secondaryColor;

        // Actualizar variables CSS
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--secondary-color', secondaryColor);
        document.documentElement.style.setProperty('--primary-hover', adjustColor(primaryColor, -20));
        document.documentElement.style.setProperty('--primary-light', adjustColor(primaryColor, 80, true));

        // Actualizar elementos con clases específicas
        document.querySelectorAll('.bg-green-500').forEach(el => {
            el.style.backgroundColor = primaryColor;
        });

        // Configurar efectos hover
        document.querySelectorAll('.hover\\:bg-green-600').forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.backgroundColor = adjustColor(primaryColor, -20);
            });
            button.addEventListener('mouseleave', () => {
                button.style.backgroundColor = primaryColor;
            });
        });

        // Configurar focus rings
        document.querySelectorAll('.focus\\:ring-green-200').forEach(element => {
            element.addEventListener('focus', () => {
                element.style.boxShadow = `0 0 0 3px ${adjustColor(primaryColor, 80, true)}`;
            });
        });
    }

    // Cargar configuración guardada o usar valores por defecto
    const savedSettings = JSON.parse(localStorage.getItem('komorebi-settings')) || defaultSettings;
    applyTheme(savedSettings);
});
