'use strict';


module.exports = {
async up (queryInterface, Sequelize) {
   await queryInterface.createTable('posts', {
     postId: {
       type: Sequelize.UUID,
       defaultValue: Sequelize.UUIDV4,
       primaryKey: true,
       allowNull: false,
     },
     userId: {
       type: Sequelize.STRING,
       allowNull: false,
       references: {
         model: 'users',
         key: 'userId',
       },
       onDelete: 'CASCADE'
     },
     title: {
       type: Sequelize.STRING,
       allowNull: false,
     },
     content: {
       type: Sequelize.TEXT,
       allowNull: false,
     },
     author: {
       type: Sequelize.STRING,
       allowNull: false,
     },
     image: {
       type: Sequelize.STRING,
       allowNull: true,
       defaultValue: 'https://static.independent.co.uk/2023/07/07/10/iStock-515064346.jpg?quality=75&width=1200&auto=webp'
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


async down (queryInterface, Sequelize) {
   await queryInterface.dropTable('posts');
 },
};
