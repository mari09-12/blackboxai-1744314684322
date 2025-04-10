document.addEventListener('DOMContentLoaded', () => {
    const toolsGrid = document.getElementById('toolsGrid');
    const searchInput = document.getElementById('searchTools');
    const filterButtons = document.querySelectorAll('[data-category]');
    const template = document.getElementById('tool-template');

    let currentCategory = 'all';
    let searchTerm = '';
    let toolsData = [];

    // Cargar datos de herramientas
    async function loadToolsData() {
        try {
            const response = await fetch('data/tools.json');
            if (!response.ok) {
                throw new Error('Error al cargar las herramientas');
            }
            toolsData = await response.json();
            renderTools();
        } catch (error) {
            console.error('Error:', error);
            toolsGrid.innerHTML = `
                <div class="col-span-full text-center text-red-600 p-4">
                    <p>Hubo un error al cargar las herramientas. Por favor, intenta recargar la página.</p>
                </div>
            `;
        }
    }

    // Renderizar herramientas
    function renderTools() {
        toolsGrid.innerHTML = '';
        const filteredTools = toolsData.filter(tool => {
            const matchesCategory = currentCategory === 'all' || tool.category === currentCategory;
            const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                tool.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        if (filteredTools.length === 0) {
            toolsGrid.innerHTML = `
                <div class="col-span-full text-center text-gray-600 p-4">
                    <p>No se encontraron herramientas que coincidan con tu búsqueda.</p>
                </div>
            `;
            return;
        }

        filteredTools.forEach(tool => {
            const card = createToolCard(tool);
            toolsGrid.appendChild(card);
        });
    }

    // Crear tarjeta de herramienta
    function createToolCard(tool) {
        const clone = template.content.cloneNode(true);
        
        // Llenar la plantilla con los datos de la herramienta
        clone.querySelector('h3').textContent = tool.name;
        
        const categorySpan = clone.querySelector('.bg-green-100');
        categorySpan.textContent = tool.category === 'mindfulness' ? 'Mindfulness' : 'Otra Técnica';
        categorySpan.className = tool.category === 'mindfulness' 
            ? 'inline-block bg-green-100 text-green-800 text-sm px-2 py-1 rounded'
            : 'inline-block bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded';

        clone.querySelector('p').textContent = tool.description;
        clone.querySelector('div p').textContent = tool.howItWorks;
        
        const stepsList = clone.querySelector('ol');
        tool.steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            li.className = 'mb-2';
            stepsList.appendChild(li);
        });

        // Agregar evento para expandir/colapsar detalles
        const button = clone.querySelector('button');
        const details = clone.querySelector('div:last-of-type');
        details.style.display = 'none';
        
        button.addEventListener('click', () => {
            const isExpanded = details.style.display !== 'none';
            details.style.display = isExpanded ? 'none' : 'block';
            button.textContent = isExpanded ? 'Ver más detalles' : 'Ocultar detalles';
            button.className = isExpanded 
                ? 'mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full'
                : 'mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full';
        });

        return clone;
    }

    // Event Listeners
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderTools();
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => {
                btn.classList.remove('bg-opacity-75');
            });
            button.classList.add('bg-opacity-75');
            currentCategory = button.dataset.category;
            renderTools();
        });
    });

    // Cargar datos iniciales
    loadToolsData();
});
