
class API {
    constructor() {
        this.BASE_URL = 'http://localhost:3000'; 
    }

  
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


    
    /**
     * @param {object} categoryData 
     * @returns {object|boolean} 
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
     * @param {object} siteData 
     * @returns {object|boolean} 
     */
    async addSite(siteData) {
        try {
            const response = await fetch(`${this.BASE_URL}/categories/${siteData.category_id}`, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(siteData), 
            });

            if (response.ok) { 
                return await response.json(); 
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
     * @param {number} id 
     * @param {object} siteData 
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
    


   
    /**
     * @param {number} id
     * @returns {boolean} 
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
     * @param {number} id
     * @returns {boolean} 
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