const Sequelize = require('sequelize');
const express = require('express');
const bodyParser = require('body-parser');


require('dotenv').config(); // Load the .env file

// Access environment variables
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;



// const sequelize = new Sequelize('digicart', 'root', 'root123', {
//   host: 'localhost',
//   dialect: 'mysql'
// });
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: 'mysql'
});
sequelize.authenticate()
  .then(() => {
    console.log('User Connected to MySQL server');
  })
  .catch((error) => {
    console.error('Unable to connect to MySQL server:', error);
  });

  const customers = sequelize.define('customers', {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,

      allowNull: false,
      unique: true
    },
    cpassword: {
      type: Sequelize.STRING,
      allowNull: false
    },
    confirmPassword :{
      type: Sequelize.STRING,
      allowNull:false
    }
  });

  const Otp = sequelize.define('Otp', {
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
otp :{
    type : Sequelize.INTEGER,
    allowNull : false
}
  });

  const reset = sequelize.define('reset', {
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    newPassword:{
      type : Sequelize.STRING,
      allowNull : false
    },
otp :{
    type : Sequelize.INTEGER,
    allowNull : false
}
  });

  const Order = sequelize.define('Order', {
    userEmail: {
      type: Sequelize.STRING,
      allowNull: false
    },
    orderData: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    orderDate: {
      type: Sequelize.DATE,
      allowNull: false
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  });
  



  const items = sequelize.define('item', {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    img: {
      type: Sequelize.TEXT({ length: 'long' }),
      allowNull: false
    },
    price: {
      type: Sequelize.TEXT({ length: 'long' }),
      allowNull: false
    },
    barcode: {
      type: Sequelize.TEXT({ length: 'long' }),
      allowNull: false
    }
   
  });








  sequelize.sync()
  .then(() => {
    console.log('Schema synchronized with database');
  })
  .catch((error) => {
    console.error('Unable to synchronize schema with database:');
  });
module.exports =  {customers,Otp,reset,Order,items} 