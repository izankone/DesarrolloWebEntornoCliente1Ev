// www/js/index.js

// =========================================================
// 1. CONSTANTES, DATOS GLOBALES Y REFERENCIAS DEL DOM (CORREGIDO)
// =========================================================

// --- CONSTANTES ---
// La lista de iconos debe ir primero para que las variables de estado la usen.
const ICONS = ['⭐', '💻', '🔑', '🏦', '✉️', '🛡️', '⚙️', '📈', '💡', '🏠', '🚀']; 
const api = new API(); // Instancia de la clase API (Declarada UNA SOLA VEZ)

// --- VARIABLES DE ESTADO GLOBALES ---
let allCategories = [];           // Almacena todas las categorías para el filtro
let activeCategoryId = null;      // ID de la categoría actualmente seleccionada
let selectedIcon = ICONS[0];      // Icono elegido para la próxima categoría nueva

// --- ELEMENTOS DEL DOM ---
const listCategory = document.getElementById('categoryList');
const listSites = document.getElementById('sitesList');
const searchBar = document.getElementById('searchBar'); 
const btnAddSite = document.getElementById('btnAddSite');
const btnAddCategory = document.getElementById('btnAddCategory');
const btnSelectIcon = document.getElementById('btnSelectIcon'); // El botón 🖼️


// =========================================================
// 2. FUNCIONES DE LÓGICA
// =========================================================

/**
 * Carga inicial de datos: Obtiene todas las categorías y llama a pintarlas.
 */
async function loadCategories() {
    // 1. Obtener y guardar los datos completos para el filtro
    const fetchedCategories = await api.getCategories(); 
    
    // Solo actualiza la lista global si obtuviste datos (manejo de error si el servidor cae)
    if (fetchedCategories && fetchedCategories.length > 0) {
        allCategories = fetchedCategories;
    } else if (allCategories.length === 0) {
        // Si no hay datos y es la primera carga
        listCategory.innerHTML = '<li>Error al cargar o no hay categorías.</li>';
        return; 
    }

    // 2. Pintar la lista (usará allCategories)
    paintCategories(allCategories);
}

/**
 * Pinta la lista de categorías en el sidebar (Incluye Iconos, Clicks y Delete).
 */
function paintCategories(categoriesToPaint) {
    listCategory.innerHTML = "";

    categoriesToPaint.forEach((category, index) => {
        const li = document.createElement('li');
        
        // Lee el icono de la categoría. Si no existe o es nulo, usa el por defecto.
        const icon = category.icon || ICONS[0]; 
        
        // Estructura que incluye el span con la clase category-icon
        li.innerHTML = `
            <span class="category-icon">${icon}</span>
            <span data-id="${category.id}" class="${category.id === activeCategoryId ? 'active' : ''}">${category.name}</span>
            <button class="btn-action btn-delete-category" data-category-id="${category.id}">❌</button>
        `;
        
        // --- Evento Clic en el NOMBRE (para cargar sitios) ---
        li.querySelector('span:nth-child(2)').addEventListener('click', () => { 
            activeCategoryId = category.id;
            paintCategories(allCategories); // Repintar para marcar como activa
            loadSites(category.id); 
        });

        // --- Evento Clic en el BOTÓN (Eliminar Categoría) ---
        li.querySelector('.btn-delete-category').addEventListener('click', async (e) => {
            e.stopPropagation(); 
            if (confirm(`¿Estás seguro de eliminar la categoría: ${category.name}?`)) {
                if (await api.deleteCategory(category.id)) {
                    loadCategories(); 
                    if (category.id === activeCategoryId) {
                        listSites.innerHTML = '<tr><td colspan="4">Selecciona una categoría para ver los sitios</td></tr>';
                    }
                } else { alert('Error al eliminar la categoría.'); }
            }
        });

        listCategory.appendChild(li);
    });
}

/**
 * Carga y pinta la tabla de sitios para la categoría seleccionada.
 */
async function loadSites(categoryId) {
    const sites = await api.getSites(categoryId);
    listSites.innerHTML = "";

    sites.forEach(site => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${site.name}</td>
            <td>${site.user}</td>
            <td>${site.createdAt || 'N/A'}</td>
            <td>
                <button class="btn-action btn-edit">✏️</button>
                <button class="btn-action btn-delete-site" data-site-id="${site.id}">❌</button>
            </td>
        `;

        // Lógica de Eliminación de Site
        const deleteButton = row.querySelector('.btn-delete-site');
        deleteButton.addEventListener('click', async () => {
            if (confirm(`¿Estás seguro de eliminar el site: ${site.name}?`)) {
                if (await api.deleteSite(site.id)) {
                    loadSites(categoryId); 
                } else { alert('Error al eliminar el site.'); }
            }
        });

        listSites.appendChild(row);
    });
}

/**
 * Filtra las categorías en tiempo real según el texto de búsqueda.
 */
function filterData(searchTerm) {
    const lowerCaseSearch = searchTerm.toLowerCase().trim();

    if (lowerCaseSearch.length === 0) {
        paintCategories(allCategories);
        return;
    }

    const filteredCategories = allCategories.filter(cat => 
        cat.name.toLowerCase().includes(lowerCaseSearch)
    );

    paintCategories(filteredCategories); 
    listSites.innerHTML = `<tr><td colspan="4">Filtrando categorías...</td></tr>`;
}


// =========================================================
// 3. EVENT LISTENERS
// =========================================================

// Evento 1: Clic en añadir sitio (Redirección)
btnAddSite.addEventListener('click', () => {
    window.location.href = 'form.html'; 
});

// Evento 2: Búsqueda en tiempo real (Keyup)
searchBar.addEventListener('keyup', (e) => {
    filterData(e.target.value);
});


// Evento 3: Clic en el botón 🖼️ (Seleccionar Icono)
btnSelectIcon.addEventListener('click', () => {
    const iconIndex = prompt(`Selecciona el icono para la próxima categoría (Escribe el número):
    
    ${ICONS.map((icon, i) => `${i + 1}. ${icon}`).join('\n')}`); 

    const indexNumber = parseInt(iconIndex, 10);
    
    // Valida y actualiza la variable global selectedIcon
    if (indexNumber >= 1 && indexNumber <= ICONS.length) {
        selectedIcon = ICONS[indexNumber - 1]; 
        alert(`Icono seleccionado: ${selectedIcon}. Ahora haz clic en "Add category".`);
    } else if (iconIndex !== null) {
        alert(`Selección inválida. Usando el icono por defecto: ${ICONS[0]}`);
        selectedIcon = ICONS[0];
    }
});


// Evento 4: Clic en añadir categoría (Usa el icono preseleccionado)
btnAddCategory.addEventListener('click', async () => {
    const name = prompt("Nombre de la nueva categoría:");
    const newCategory = { name: name.trim(), icon: categoryIcon };
    if (name && name.trim().length > 0) {
        const categoryIcon = selectedIcon; 
        const newCategory = { name: name.trim(), icon: categoryIcon }; 

        try {
            const success = await api.addCategory(newCategory);
            
            if (success) { 
                alert(`Categoría "${name}" creada con éxito.`);
                loadCategories(); // Solo recargar si fue exitoso
            } else {
                alert('Error al crear la categoría. La API no confirmó la creación.');
            }
        } catch (error) {
            alert('¡ERROR DE CONEXIÓN! No se pudo conectar con el servidor API.');
            console.error('Error al añadir categoría:', error);
        }
        
        // ❌ LÍNEA ELIMINADA: selectedIcon = ICONS[0]; 
        // ¡Se ha quitado el reseteo automático que causaba el problema!
    }
});

// =========================================================
// 4. INICIALIZACIÓN
// =========================================================
window.onload = loadCategories;