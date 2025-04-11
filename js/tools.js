document.addEventListener('DOMContentLoaded', () => {
    const toolsList = document.getElementById('toolsList');
    const searchInput = document.getElementById('searchTools');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const toolTemplate = document.getElementById('toolTemplate');

    let currentCategory = '';
    let searchTerm = '';
    let toolsData = [];
    let activeCard = null;

    async function loadTools() {
        try {
            const response = await fetch('data/tools.json');
            if (!response.ok) throw new Error('Error al cargar las herramientas');
            
            const data = await response.json();
            toolsData = data.tools;
            renderTools();
        } catch (error) {
            console.error('Error:', error);
            toolsList.innerHTML = `
                <div class="col-span-full bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p class="text-red-600">No se pudieron cargar las herramientas. Por favor, intenta recargar la página.</p>
                </div>
            `;
        }
    }

    function renderTools() {
        const filteredTools = toolsData.filter(tool => {
            const matchesCategory = !currentCategory || tool.category === currentCategory;
            const matchesSearch = !searchTerm || 
                tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tool.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        toolsList.innerHTML = '';

        if (filteredTools.length === 0) {
            toolsList.innerHTML = `
                <div class="col-span-full bg-gray-50 rounded-lg p-4 text-center">
                    <p class="text-gray-600">No se encontraron herramientas que coincidan con tu búsqueda.</p>
                </div>
            `;
            return;
        }

        filteredTools.forEach(tool => {
            const toolCard = createToolCard(tool);
            toolsList.appendChild(toolCard);
        });
    }

    function createToolCard(tool) {
        const clone = toolTemplate.content.cloneNode(true);
        const card = clone.querySelector('.tool-card');
        
        // Set content
        clone.querySelector('.tool-name').textContent = tool.name;
        clone.querySelector('.tool-description').textContent = tool.description;
        clone.querySelector('.tool-benefits').textContent = tool.howItWorks;

        const stepsList = clone.querySelector('.tool-steps');
        tool.steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            stepsList.appendChild(li);
        });

        // Add category-based styling
        if (tool.category === 'mindfulness') {
            card.classList.add('border-l-4', 'border-blue-500');
        } else {
            card.classList.add('border-l-4', 'border-purple-500');
        }

        // Add click handler for expanding/collapsing
        card.addEventListener('click', () => {
            const details = card.querySelector('.tool-details');
            const isHidden = details.classList.contains('hidden');
            
            // Close previously active card if different from current
            if (activeCard && activeCard !== card) {
                const activeDetails = activeCard.querySelector('.tool-details');
                activeDetails.classList.add('hidden');
                activeCard.classList.remove('shadow-md', 'bg-gray-50');
                activeCard.classList.add('shadow-sm', 'bg-white');
            }

            // Toggle current card
            if (isHidden) {
                details.classList.remove('hidden');
                card.classList.remove('shadow-sm', 'bg-white');
                card.classList.add('shadow-md', 'bg-gray-50');
                activeCard = card;
            } else {
                details.classList.add('hidden');
                card.classList.remove('shadow-md', 'bg-gray-50');
                card.classList.add('shadow-sm', 'bg-white');
                activeCard = null;
            }
        });

        return clone;
    }

    // Event Listeners
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.trim();
        renderTools();
    });

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active state from all buttons
            categoryButtons.forEach(btn => {
                btn.classList.remove('bg-opacity-75');
            });
            
            // Add active state to clicked button
            button.classList.add('bg-opacity-75');
            
            currentCategory = button.dataset.category;
            renderTools();
        });
    });

    // Initialize
    loadTools();
});
