module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    avatar_url: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    language_pref: {
      type: DataTypes.STRING(10),
      defaultValue: 'en',
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
  })

  return User
}