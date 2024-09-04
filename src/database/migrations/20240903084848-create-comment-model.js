'use strict';


module.exports = {
 up: async (queryInterface, Sequelize) => {
   await queryInterface.createTable('comments', {
     CommentId: {
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
       onDelete: 'CASCADE',
     },
     PostId: {
       type: Sequelize.UUID,
       allowNull: false,
       references: {
         model: 'posts',
         key: 'postId',
       },
       onDelete: 'CASCADE',
     },
     comment: {
       type: Sequelize.STRING,
       allowNull: false,
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


 down: async (queryInterface, Sequelize) => {
   await queryInterface.dropTable('comments');
 },
};
