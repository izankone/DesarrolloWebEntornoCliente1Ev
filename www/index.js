// www/js/index.js

// 1. Instanciar la API
const api = new API();

// 2. Referencias a elementos del DOM
const listCategory = document.getElementById('categoryList');
const listSites = document.getElementById('sitesList');

// 3. Función inicial al cargar la página
window.onload = async () => {
    await loadCategories();
};

// Función para cargar y pintar categorías
async function loadCategories() {
    const categories = await api.getCategories();
    
    // Limpiamos la lista actual
    listCategory.innerHTML = "";

    categories.forEach(category => {
        // Crear elemento <li> para cada categoría
        const li = document.createElement('li');
        li.textContent = category.name; // Asumimos que el objeto tiene propiedad 'name'
        
        // Evento: Al hacer clic en una categoría, cargar sus sitios
        li.addEventListener('click', () => {
            loadSites(category.id); // Asumimos que tiene 'id'
            
            // (Opcional) Resaltar la categoría seleccionada visualmente
            document.querySelectorAll('#categoryList li').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
        });

        listCategory.appendChild(li);
    });
}

// Función para cargar sitios de una categoría
async function loadSites(categoryId) {
    const sites = await api.getSites(categoryId);
    
    // Limpiar tabla
    listSites.innerHTML = "";

    sites.forEach(site => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${site.name}</td>
            <td>${site.user}</td>
            <td>${site.createdAt || 'N/A'}</td>
            <td>
                <button class="btn-action">✏️</button>
                <button class="btn-action">❌</button>
            </td>
        `;
        listSites.appendChild(row);
    });
}
// En index.js

// Referencia al botón de añadir categoría
const btnAddCategory = document.getElementById('btnAddCategory');

btnAddCategory.addEventListener('click', async () => {
    // 1. Pedimos el nombre al usuario (simple por ahora)
    const name = prompt("Nombre de la nueva categoría:");
    
    // 2. Si escribió algo, lo guardamos
    if (name) {
        await api.addCategory(name); // Guardar en servidor
        loadCategories();            // Recargar la lista para ver el cambio
    }
});