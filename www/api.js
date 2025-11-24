// www/js/api.js

class API {
    constructor() {
        this.baseUrl = "http://localhost:3000";
    }

    // Obtener todas las categorías
    async getCategories() {
        try {
            const response = await fetch(`${this.baseUrl}/categories`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error cargando categorías:", error);
        }
    }

    // Obtener sites de una categoría específica
    async getSites(categoryId) {
        try {
            const response = await fetch(`${this.baseUrl}/categories/${categoryId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error cargando sites:", error);
        }
    }
    
    // Aquí añadiremos más métodos luego (addCategory, deleteSite, etc.)
    
    async addCategory(categoryName) {
        try {
            const response = await fetch(`${this.baseUrl}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: categoryName })
            });
            return await response.json();
        } catch (error) {
            console.error("Error creando categoría:", error);
        }
    }
}