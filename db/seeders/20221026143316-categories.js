'use strict';

const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
   let categories = Array(10).fill(0).map( (v,idx) => ({
    name: faker.company.bsNoun(),
    createdAt: new Date(),
    updatedAt: new Date(),
   }))


   await queryInterface.bulkInsert('Categories', categories)
  },

  async down (queryInterface, Sequelize) {
   
  }
};
