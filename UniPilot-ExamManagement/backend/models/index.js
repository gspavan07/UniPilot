const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const sequelize = require("../config/db_connection"); // Changed to point to our db_connection file
const db = {};

// Since we are manually creating/copying models, we might not have them all as files yet.
// For now, let's explicitly load the User model.
// BUT to be scalable and match Main style, let's scan directory.

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file));
    // Check if model is a function (sequelize.define wrapper) or an instance
    // The copied User.js uses sequelize.define directly, so it returns the model class if we export it directly.
    // However, Main User.js does: const User = sequelize.define(...); module.exports = User;
    // So requiring it returns the Model class directly.
    if (model.name) {
      db[model.name] = model;
    }
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
