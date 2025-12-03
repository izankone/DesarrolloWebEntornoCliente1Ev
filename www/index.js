
const ICONS = ['⭐', '💻', '🔑', '🏦', '✉️', '🛡️', '⚙️', '📈', '💡', '🏠', '🚀'];
const api = new API(); 

let allCategories = [];        
let currentSites = [];         
let activeCategoryId = null;   

const listCategory = document.getElementById('categoryList');
const listSites = document.getElementById('sitesList');
const searchBar = document.getElementById('searchBar');
const btnAddSite = document.getElementById('btnAddSite');
const btnAddCategory = document.getElementById('btnAddCategory');





async function loadCategories() {
    const fetchedCategories = await api.getCategories();
    
    if (fetchedCategories && fetchedCategories.length > 0) {
        allCategories = fetchedCategories;
    } else if (allCategories.length === 0) {
        listCategory.innerHTML = '<li>Error al cargar o no hay categorías.</li>';
        return;
    }

    paintCategories(allCategories);
}


function paintCategories(categoriesToPaint) {
    listCategory.innerHTML = "";

    categoriesToPaint.forEach((category) => {
        const li = document.createElement('li');
        
        const icon = category.icon || ICONS[0];
        const isActiveClass = category.id === activeCategoryId ? 'active' : '';
        
        li.innerHTML = `
            <span class="category-icon">${icon}</span>
            <span data-id="${category.id}" class="${isActiveClass}" style="flex-grow:1;">${category.name}</span>
            <button class="btn-action btn-delete-category" data-category-id="${category.id}">❌</button>
        `;
        
        li.querySelector('span:nth-child(2)').addEventListener('click', () => {
            activeCategoryId = category.id;
            paintCategories(allCategories); 
            loadSites(category.id);
        });

        li.querySelector('.btn-delete-category').addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm(`¿Estás seguro de eliminar la categoría: ${category.name}?`)) {
                if (await api.deleteCategory(category.id)) {
                    await loadCategories(); 
                    if (category.id === activeCategoryId) {
                        listSites.innerHTML = '<tr><td colspan="5">Selecciona una categoría para ver los sitios</td></tr>';
                        activeCategoryId = null;
                        currentSites = [];
                    }
                } else { alert('Error al eliminar la categoría.'); }
            }
        });

        listCategory.appendChild(li);
    });
}


async function loadSites(categoryId) {
    currentSites = await api.getSites(categoryId);
    paintSites(currentSites);
}


function paintSites(sitesToPaint) {
    listSites.innerHTML = "";

    if (sitesToPaint.length === 0) {
        listSites.innerHTML = '<tr><td colspan="5">No hay sitios en esta categoría (o no coinciden con la búsqueda).</td></tr>';
        return;
    }

    sitesToPaint.forEach(site => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${site.name}</td>
            <td>${site.url}</td>
            <td>${site.user}</td>
            <td>${site.createdAt || 'N/A'}</td>
            <td>
                <button class="btn-action btn-open" title="Abrir URL">🔗</button>
                <button class="btn-action btn-edit" title="Editar">✏️</button>
                <button class="btn-action btn-delete-site" data-site-id="${site.id}" title="Eliminar">❌</button>
            </td>
        `;

        const openButton = row.querySelector('.btn-open');
        openButton.addEventListener('click', () => {
            let urlDestino = site.url;
            if (!urlDestino.startsWith('http')) {
                urlDestino = 'https://' + urlDestino;
            }
            window.open(urlDestino, '_blank');
        });

        const editButton = row.querySelector('.btn-edit');
        editButton.addEventListener('click', () => {
            editarSite(site); 
        });

        const deleteButton = row.querySelector('.btn-delete-site');
        deleteButton.addEventListener('click', async () => {
            if (confirm(`¿Estás seguro de eliminar el site: ${site.name}?`)) {
                if (await api.deleteSite(site.id)) {
                    loadSites(activeCategoryId); 
                } else { alert('Error al eliminar el site.'); }
            }
        });

        listSites.appendChild(row);
    });
}


async function editarSite(site) {
    const { value: formValues } = await Swal.fire({
        title: 'Editar Site',
        html:
            `<input id="swal-edit-name" class="swal2-input" placeholder="Nombre" value="${site.name}">` +
            `<input id="swal-edit-url" class="swal2-input" placeholder="URL" value="${site.url}">` +
            `<input id="swal-edit-user" class="swal2-input" placeholder="Usuario" value="${site.user}">` +
            `<input id="swal-edit-pass" class="swal2-input" type="text" placeholder="Contraseña" value="${site.password}">` +
            `<textarea id="swal-edit-desc" class="swal2-textarea" placeholder="Descripción">${site.description}</textarea>`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Actualizar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                name: document.getElementById('swal-edit-name').value,
                url: document.getElementById('swal-edit-url').value,
                user: document.getElementById('swal-edit-user').value,
                password: document.getElementById('swal-edit-pass').value,
                description: document.getElementById('swal-edit-desc').value
            };
        }
    });

    if (formValues) {
        const updatedData = {
            ...formValues,
            category_id: site.categoryId 
        };

        const success = await api.updateSite(site.id, updatedData);

        if (success) {
            Swal.fire('¡Actualizado!', 'El sitio ha sido modificado.', 'success');
            loadSites(activeCategoryId); 
        } else {
            Swal.fire('Error', 'No se pudo actualizar el sitio.', 'error');
        }
    }
}


function filterData(searchTerm) {
    const lowerCaseSearch = searchTerm.toLowerCase().trim();

    
    const filteredCategories = allCategories.filter(cat =>
        cat.name.toLowerCase().includes(lowerCaseSearch)
    );
    paintCategories(filteredCategories);

    
    if (activeCategoryId && currentSites.length > 0) {
        if (lowerCaseSearch.length === 0) {
            paintSites(currentSites);
        } else {
            const filteredSites = currentSites.filter(site =>
                site.name.toLowerCase().includes(lowerCaseSearch) ||
                site.url.toLowerCase().includes(lowerCaseSearch) ||
                site.user.toLowerCase().includes(lowerCaseSearch)
            );
            paintSites(filteredSites);
        }
    }
}



btnAddSite.addEventListener('click', () => {
    window.location.href = 'form.html';
});

searchBar.addEventListener('keyup', (e) => {
    filterData(e.target.value);
});

btnAddCategory.addEventListener('click', async () => {
    const { value: formValues } = await Swal.fire({
        title: 'Nueva Categoría',
        html:
            '<input id="swal-input-name" class="swal2-input" placeholder="Nombre de la categoría">' +
            '<select id="swal-select-icon" class="swal2-select">' +
            ICONS.map(icon => `<option value="${icon}">${icon}</option>`).join('') +
            '</select>',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
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

    if (formValues) {
        const newCategory = {
            name: formValues.name,
            icon: formValues.icon
        };

        try {
            const success = await api.addCategory(newCategory);
            if (success) {
                Swal.fire({
                    icon: 'success',
                    title: `Categoría "${newCategory.name}" creada.`,
                    showConfirmButton: false,
                    timer: 1500
                });
                loadCategories();
            } else {
                Swal.fire('Error', 'Error al crear la categoría.', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error');
        }
    }
});


window.onload = loadCategories;