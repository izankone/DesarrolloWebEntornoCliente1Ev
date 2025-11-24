// www/js/form.js

// =========================================================
// 1. INSTANCIACIÓN DE CLASES Y DATOS GLOBALES
// =========================================================
const api = new API(); // Instanciamos la clase API (asumimos que está en api.js)


// =========================================================
// 2. REFERENCIAS A ELEMENTOS DEL DOM
// =========================================================
const siteForm = document.getElementById('siteForm');
const categorySelect = document.getElementById('category_id'); // <select> de categorías
const btnCancel = document.getElementById('btnCancel');
const passwordInput = document.getElementById('password'); 
const btnGeneratePass = document.getElementById('btnGeneratePass');
const nameInput = document.getElementById('name');       // Campo Nombre/URL
const userInput = document.getElementById('user');         // Campo Usuario
const descriptionInput = document.getElementById('description'); // Campo Descripción (asumiendo este ID)


// =========================================================
// 3. FUNCIONES DE LÓGICA
// =========================================================

/**
 * Carga las categorías desde la API y las pinta en el <select> del formulario.
 */
async function loadCategoriesIntoSelect() {
    if (!categorySelect) return; 
    
    const categories = await api.getCategories();
    categorySelect.innerHTML = ''; // Limpiar opciones
    
    // Opción por defecto
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "-- Selecciona una categoría --";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    categorySelect.appendChild(defaultOption);

    // Rellenar con las categorías
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
    });
}


/**
 * Genera una contraseña segura de longitud variable.
 * @param {number} length - Longitud deseada de la contraseña (mínimo 8 recomendado).
 * @returns {string} Contraseña segura y mezclada.
 */
function generateSecurePassword(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    const all = chars + numbers + symbols;

    let password = '';
    
    // Aseguramos al menos un caracter de cada tipo
    password += chars[Math.floor(Math.random() * chars.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Rellenamos el resto
    for (let i = password.length; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }
    
    // Mezclamos
    return password.split('').sort(() => 0.5 - Math.random()).join('');
}

/**
 * Valida un campo individual y aplica el estilo de error.
 * @param {HTMLElement} inputElement - El input a validar.
 */
function validateInputOnBlur(inputElement) {
    // Solo validamos campos obligatorios
    // Nota: Se asume que los inputs en el HTML tienen el atributo 'required'
    if (inputElement.value.trim() === '') {
        inputElement.classList.add('input-error');
    } else {
        inputElement.classList.remove('input-error');
    }
}


// =========================================================
// 4. EVENT LISTENERS
// =========================================================

// Listener 1: Manejar el envío del formulario (Guardar Site)
siteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Recoger los datos del formulario
    const siteData = {
        category_id: categorySelect.value,
        name: nameInput.value.trim(),
        url: nameInput.value.trim(), // Usamos 'name' para URL/Nombre
        user: userInput.value.trim(),
        password: passwordInput.value,
        description: descriptionInput.value.trim()
    };

    // Validación obligatoria
    if (!siteData.name || !siteData.user || !siteData.password || !siteData.category_id) {
        alert("Todos los campos con asterisco (*) son obligatorios.");
        return; 
    }
    
    // El atributo category_id debe ser un número entero para la API
    siteData.category_id = parseInt(siteData.category_id, 10);

    const success = await api.addSite(siteData);

    if (success) {
        alert("Site guardado con éxito.");
        // Volver a la página principal tras guardar
        window.location.href = 'index.html'; 
    } else {
        alert("Error al guardar el site. Revisa la consola.");
    }
});

// Listener 2: Botón Cancelar (Volver a la vista principal)
btnCancel.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Listener 3: Botón Generador de Contraseña (Extra)
btnGeneratePass.addEventListener('click', () => {
    const newPass = generateSecurePassword(12);
    passwordInput.value = newPass;
    
    // Mostrar temporalmente la clave generada
    passwordInput.type = 'text'; 
    
    setTimeout(() => {
        passwordInput.type = 'password';
    }, 2000); // Ocultar después de 2 segundos
});

// Listener 4: Validación dinámica (Evento blur)
// Campos obligatorios: name, user, password
const requiredInputs = [nameInput, userInput, passwordInput];

requiredInputs.forEach(input => {
    input.addEventListener('blur', () => {
        validateInputOnBlur(input);
    });
});


// =========================================================
// 5. INICIALIZACIÓN DE LA APLICACIÓN
// =========================================================
// La función principal que se ejecuta al cargar la página
window.onload = loadCategoriesIntoSelect;