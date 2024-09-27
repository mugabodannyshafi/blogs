'use strict';


/** @type {import('sequelize-cli').Migration} */
module.exports = {
 async up(queryInterface, Sequelize) {
   await queryInterface.createTable('users', {
     userId: {
       allowNull: false,
       primaryKey: true,
       type: Sequelize.STRING,
       defaultValue: Sequelize.UUIDV4,
     },
     email: {
       type: Sequelize.STRING,
       unique: true,
       allowNull: false,
     },
     username: {
       type: Sequelize.STRING,
       allowNull: false,
     },
     password: {
       type: Sequelize.STRING,
       allowNull: false,
     },
     password_confirmation: {
       type: Sequelize.STRING,
       allowNull: false,
     },
     profile: {
       type: Sequelize.STRING,
       allowNull: false,
       defaultValue: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png',
     },
     otp: {
       type: Sequelize.STRING,
       allowNull: true,
     },
     otpExpiresAt: {
       type: Sequelize.DATE,
       allowNull: true,
     },
     createdAt: {
       type: Sequelize.DATE,
       allowNull: false,
       defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
     },
     updatedAt: {
       type: Sequelize.DATE,
       allowNull: false,
       defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
     },
   });
 },


 async down(queryInterface, Sequelize) {
   await queryInterface.dropTable('users');
 },
};
