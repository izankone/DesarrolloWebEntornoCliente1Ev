
const api = new API(); 


const siteForm = document.getElementById('siteForm');
const categorySelect = document.getElementById('category_id'); 
const btnCancel = document.getElementById('btnCancel');
const passwordInput = document.getElementById('password'); 
const btnGeneratePass = document.getElementById('btnGeneratePass');
const nameInput = document.getElementById('name');       
const userInput = document.getElementById('user');         
const descriptionInput = document.getElementById('description'); 





async function loadCategoriesIntoSelect() {
    if (!categorySelect) return; 
    
    const categories = await api.getCategories();
    categorySelect.innerHTML = ''; 
    
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "-- Selecciona una categoría --";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    categorySelect.appendChild(defaultOption);

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
    });
}


/**
 * @param {number} length 
 * @returns {string} 
 */
function generateSecurePassword(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    const all = chars + numbers + symbols;

    let password = '';
    
    password += chars[Math.floor(Math.random() * chars.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = password.length; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }
    
    return password.split('').sort(() => 0.5 - Math.random()).join('');
}

/**
 * @param {HTMLElement} inputElement 
 */
function validateInputOnBlur(inputElement) {
    if (inputElement.value.trim() === '') {
        inputElement.classList.add('input-error');
    } else {
        inputElement.classList.remove('input-error');
    }
}



siteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const siteData = {
        category_id: categorySelect.value,
        name: nameInput.value.trim(),
        url: nameInput.value.trim(), 
        user: userInput.value.trim(),
        password: passwordInput.value,
        description: descriptionInput.value.trim()
    };

    if (!siteData.name || !siteData.user || !siteData.password || !siteData.category_id) {
        alert("Todos los campos con asterisco (*) son obligatorios.");
        return; 
    }
    
    siteData.category_id = parseInt(siteData.category_id, 10);

    const success = await api.addSite(siteData);

    if (success) {
        alert("Site guardado con éxito.");
        window.location.href = 'index.html'; 
    } else {
        alert("Error al guardar el site. Revisa la consola.");
    }
});

btnCancel.addEventListener('click', () => {
    window.location.href = 'index.html';
});

btnGeneratePass.addEventListener('click', () => {
    const newPass = generateSecurePassword(12);
    passwordInput.value = newPass;
    
    passwordInput.type = 'text'; 
    
    setTimeout(() => {
        passwordInput.type = 'password';
    }, 2000); 
});

const requiredInputs = [nameInput, userInput, passwordInput];

requiredInputs.forEach(input => {
    input.addEventListener('blur', () => {
        validateInputOnBlur(input);
    });
});



window.onload = loadCategoriesIntoSelect;