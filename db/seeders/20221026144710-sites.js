'use strict';

const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
 
     let sites = Array(25).fill(0).map( (v,idx) => ({
      name: faker.company.name(),
      url: faker.internet.url(),
      user: faker.internet.userName(),
      password: faker.internet.password(),
      description: faker.lorem.paragraphs(5),
      categoryId: faker.datatype.number({ min: 0, max: 10 }),
      createdAt: new Date(),
      updatedAt: new Date()
     }))
     await queryInterface.bulkInsert('Sites', sites)
  },

  async down (queryInterface, Sequelize) {
    
  }
};
