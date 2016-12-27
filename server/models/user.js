
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('User', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: (models) => {
        user.belongsTo(models.role, {
          foreignKey: {
            allowNull: false
          },
          onDelete: 'CASCADE'
        });
        user.hasMany(models.document, {
          foreignKey: {
            name: 'ownerId',
            allowNull: false,
          },
          onDelete: 'CASCADE'
        });
      }
    }
  });
  return user;
};
