// www/api.js

class API {
    constructor() {
        // La URL base para las peticiones a json-server
        this.BASE_URL = 'http://localhost:3000'; 
    }

    // =========================================================
    // 1. MÉTODOS GET (LECTURA)
    // =========================================================

    /**
     * Obtiene todas las categorías desde el servidor.
     */
    async getCategories() {
        try {
            const response = await fetch(`${this.BASE_URL}/categories`);
            
            if (!response.ok) {
                console.error(`Error HTTP ${response.status} al obtener categorías.`);
                return []; 
            }
            return await response.json();
        } catch (error) {
            console.error('⚠️ ERROR CRÍTICO DE RED: No se pudo conectar con el servidor de la API.', error);
            alert('ERROR: El servidor de la API está apagado o no responde.');
            return [];
        }
    }

    /**
     * Obtiene los sitios web para una categoría específica.
     */
    async getSites(categoryId) {
        try {
            const response = await fetch(`${this.BASE_URL}/sites?categoryId=${categoryId}`);
            if (!response.ok) {
                console.error(`Error HTTP ${response.status} al obtener sitios.`);
                return []; 
            }
            return await response.json();
        } catch (error) {
            console.error('Error de red al obtener sitios:', error);
            return [];
        }
    }


    // =========================================================
    // 2. MÉTODOS POST (ESCRITURA)
    // =========================================================

    /**
     * Añade una nueva categoría al servidor.
     * @param {object} categoryData - Objeto con {name: string, icon: string}
     * @returns {object|boolean} La categoría creada o false si falla.
     */
    async addCategory(categoryData) {
        try {
            const response = await fetch(`${this.BASE_URL}/categories`, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData), 
            });
    
            if (response.ok) { 
                return await response.json();
            } else {
                const errorText = await response.text();
                console.error(`❌ Fallo al crear la categoría (Status: ${response.status}):`, errorText);
                return false;
            }
        } catch (error) {
            console.error('⚠️ ERROR DE RED al intentar añadir la categoría:', error);
            alert('ERROR: No se pudo guardar la categoría. Revise la consola y el servidor.');
            return false;
        }
    }
    
    /**
     * Añade un nuevo sitio web al servidor. (¡IMPLEMENTACIÓN FALTANTE!)
     * @param {object} siteData - Objeto con datos del sitio.
     * @returns {object|boolean} El sitio creado o false si falla.
     */
    async addSite(siteData) {
        try {
            const response = await fetch(`${this.BASE_URL}/categories/${siteData.category_id}`, {
                method: 'POST', // Debe ser POST
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(siteData), // Enviar los datos
            });

            if (response.ok) { 
                return await response.json(); // Devuelve el objeto creado
            } else {
                const errorText = await response.text();
                console.error(`❌ Fallo al crear el site (Status: ${response.status}):`, errorText);
                return false;
            }
        } catch (error) {
            console.error('⚠️ ERROR DE RED al intentar añadir el site:', error);
            alert('ERROR CRÍTICO: El servidor de la API está apagado o no responde.');
            return false;
        }
    }
    /**
     * Actualiza un sitio existente.
     * @param {number} id - ID del sitio a actualizar.
     * @param {object} siteData - Nuevos datos del sitio.
     */
    async updateSite(id, siteData) {
        try {
            const response = await fetch(`${this.BASE_URL}/sites/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(siteData),
            });
            return response.ok;
        } catch (error) {
            console.error('Error al actualizar sitio:', error);
            return false;
        }
    }
    


    // =========================================================
    // 3. MÉTODOS DELETE (ELIMINAR)
    // =========================================================

    /**
     * Elimina una categoría por su ID.
     * @param {number} id
     * @returns {boolean} True si fue exitoso.
     */
    async deleteCategory(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/categories/${id}`, {
                method: 'DELETE',
            });
            return response.ok;
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            return false;
        }
    }
    
    /**
     * Elimina un sitio web por su ID.
     * @param {number} id
     * @returns {boolean} True si fue exitoso.
     */
    async deleteSite(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/sites/${id}`, {
                method: 'DELETE',
            });
            return response.ok;
        } catch (error) {
            console.error('Error al eliminar sitio:', error);
            return false;
        }
    }
}