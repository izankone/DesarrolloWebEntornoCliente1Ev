'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
// La ruta ya está corregida a '../../config/config.json'
const config = require(__dirname + '/../../config/config.json')[env]; 

let sequelize;
// 1. Inicializa la conexión a Sequelize
if (config.use_env_variable) {
 // Esta parte solo se usa si tienes una variable de entorno para la URI de la BD
sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
 // Esta es la parte que asegura que se usan las propiedades del config.json
 sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// 🔑 CORRECCIÓN: Inicializar la variable 'db' antes de usarla.
const db = {}; 

// 2. Carga dinámica de los modelos (Category, Site, etc.)
fs
 .readdirSync(__dirname)
  .filter(file => {
  return (
 file.indexOf('.') !== 0 &&
 file !== basename &&
 file.slice(-3) === '.js' &&
 file.indexOf('.test.js') === -1
 );
 })
 .forEach(file => {
  const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
  db[model.name] = model; // Aquí es donde fallaba antes, porque 'db' no existía
 });

// 3. Establece las asociaciones entre modelos
Object.keys(db).forEach(modelName => {
 if (db[modelName].associate) {
  db[modelName].associate(db);
 }
});

// 4. Exporta las instancias de Sequelize
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;