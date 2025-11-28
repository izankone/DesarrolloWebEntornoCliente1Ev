// www/js/index.js

// =========================================================
// 1. CONSTANTES, DATOS GLOBALES Y REFERENCIAS DEL DOM
// =========================================================

// --- CONSTANTES ---
const ICONS = ['⭐', '💻', '🔑', '🏦', '✉️', '🛡️', '⚙️', '📈', '💡', '🏠', '🚀'];
const api = new API(); // Asume que la clase API está definida en api.js

// --- VARIABLES DE ESTADO GLOBALES ---
let allCategories = [];        // Almacena todas las categorías para el filtro
let activeCategoryId = null;   // ID de la categoría actualmente seleccionada
// 'selectedIcon' fue eliminada ya que la selección se hace en el SweetAlert2.

// --- ELEMENTOS DEL DOM ---
const listCategory = document.getElementById('categoryList');
const listSites = document.getElementById('sitesList');
const searchBar = document.getElementById('searchBar');
const btnAddSite = document.getElementById('btnAddSite');
const btnAddCategory = document.getElementById('btnAddCategory');
// 'btnSelectIcon' fue eliminada.


// =========================================================
// 2. FUNCIONES DE LÓGICA
// =========================================================

/**
 * Carga inicial de datos: Obtiene todas las categorías y llama a pintarlas.
 */
async function loadCategories() {
    // 1. Obtener y guardar los datos completos para el filtro
    const fetchedCategories = await api.getCategories();
    
    if (fetchedCategories && fetchedCategories.length > 0) {
        allCategories = fetchedCategories;
    } else if (allCategories.length === 0) {
        // Si no hay datos, muestra un mensaje de error o sin categorías
        listCategory.innerHTML = '<li>Error al cargar o no hay categorías.</li>';
        return;
    }

    // 2. Pintar la lista (usará allCategories)
    paintCategories(allCategories);
}

/**
 * Pinta la lista de categorías en el sidebar.
 */
function paintCategories(categoriesToPaint) {
    listCategory.innerHTML = "";

    categoriesToPaint.forEach((category, index) => {
        const li = document.createElement('li');
        
        // Lee el icono de la categoría.
        const icon = category.icon || ICONS[0];
        const isActive = category.id === activeCategoryId ? 'active' : '';
        
        li.innerHTML = `
            <span class="category-icon">${icon}</span>
            <span data-id="${category.id}" class="${isActive}">${category.name}</span>
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
                        activeCategoryId = null;
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


// Evento 3: Clic en añadir categoría (¡IMPLEMENTACIÓN CON SWEETALERT2!)
btnAddCategory.addEventListener('click', async () => {
    // 1. Lanzar el diálogo de SweetAlert2 con los campos de entrada
    const { value: formValues } = await Swal.fire({
        title: 'Nueva Categoría',
        html:
            '<input id="swal-input-name" class="swal2-input" placeholder="Nombre de la categoría" required>' +
            // Genera el <select> con todos los iconos disponibles
            '<select id="swal-select-icon" class="swal2-select">' +
            ICONS.map(icon => `<option value="${icon}">${icon} ${icon}</option>`).join('') +
            '</select>',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        // Validación y recopilación de datos antes de cerrar el modal
        preConfirm: () => {
            const name = document.getElementById('swal-input-name').value;
            const icon = document.getElementById('swal-select-icon').value;
            if (!name.trim()) {
                Swal.showValidationMessage('Debes ingresar un nombre para la categoría');
                return false;
            }
            return { name: name.trim(), icon: icon };
        }
    });

    // 2. Procesar el resultado (solo si el usuario confirmó)
    if (formValues) {
        const name = formValues.name;
        const categoryIcon = formValues.icon; 

        const newCategory = {
            name: name,
            icon: categoryIcon
        };

        try {
            const success = await api.addCategory(newCategory);

            if (success) {
                // Notificación de éxito
                Swal.fire({
                    icon: 'success',
                    title: `Categoría "${name}" creada con éxito.`,
                    showConfirmButton: false,
                    timer: 1500
                });
                loadCategories(); // Recargar la lista
            } else {
                Swal.fire('Error', 'Error al crear la categoría. La API no confirmó la creación.', 'error');
            }
        } catch (error) {
            // Error de conexión a la API
            Swal.fire('ERROR DE CONEXIÓN', 'No se pudo conectar con el servidor API. Verifica que esté corriendo.', 'error');
            console.error('Error al añadir categoría:', error);
        }
    }
});
    


// =========================================================
// 4. INICIALIZACIÓN
// =========================================================
// Llama a cargar las categorías al iniciar la página
window.onload = loadCategories;