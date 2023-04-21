
// chatgpt

const BASE_URL = "http://localhost:5000";

 const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
const JWT_SECRET = "Parasisgoodb$oi"
const {customers,Otp,reset,Order,items} = require('./models/User');
// const Sequelize = require('sequelize');
const express = require('express');
const bodyParser = require('body-parser');

const { body, validationResult } = require('express-validator');
const mysql = require('mysql');

const cors = require('cors');

  const app = express();
  app.use(bodyParser.json());
  app.use(cors());

// // signup actaul
const bcrypt = require('bcryptjs');
app.post('/userpost', [
  // Validate the name field
  body('name').notEmpty().isLength({ max: 255 }),

  // Validate the email field
  body('email').notEmpty().isEmail(),

  // Validate the password field
  body('cpassword').notEmpty().isLength({ min: 6 }),

  // Validate the confirm password field
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.cpassword) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
], async  (req, res) => {
  var success=false;
  // Check if there are any validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success, errors: errors.array() });
  }

 // Hash the password
 const salt = await bcrypt.genSalt(10);
 const hashedPassword = await bcrypt.hash(req.body.cpassword, salt);


  // Insert the user data into the MySQL database
  const { name, email, cpassword  ,confirmPassword } = req.body;
 
  customers.create({ name, email, cpassword : hashedPassword ,confirmPassword })
  .then((customers) => {
    const token = jwt.sign(customers.id, JWT_SECRET);
    console.log(token);
    success=true;
            res.status(201).json({success,customers,token});
          })
          .catch((error) => {
           console.log("Error hai :",error);
              });
 
});



// login actaul
app.post('/login', async (req, res) => {
  var success = false ;
  const { email, cpassword } = req.body;

  // Find the user in the MySQL database
  const user = await customers.findOne({ where: { email: email } });
  if (!user) {
    return res.status(400).json({success, message: 'Invalid credentials' });
  }

  // Compare the password with the hashed password in the database
  const isValidPassword = await bcrypt.compare(cpassword, user.cpassword);
  if (!isValidPassword) {
    return res.status(400).json({success, message: 'Invalid credentials' });
  }

  // Create and send a JWT token as a response
  success=true;
  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  res.json({success, token });
});

//reset
const OTP_SECRET = "MyOTPSecret";
const OTP_LENGTH = 6;
// Generate a random OTP
function generateOTP() {
  let otp = '';
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp; // giving otp as 6 characters
}
// Store the OTP in memory for testing purposes
let otpStore = {};

// // Reset password endpoint - 2

// node mailer
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'parasraut821@gmail.com',
    pass: 'ttspsqvexjgjlepb'
  }
});


app.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  const otp = req.body.otp;
  // Find the user in the MySQL database
  const user = await customers.findOne({ where: { email: email } });
  if (!user) {
    return res.status(400).json({ success: false, message: 'User not found' });
  }

  // Generate an OTP and sign it with a secret key
  const otpp = generateOTP();
  const otpToken = jwt.sign({ email: email, otpp: otpp }, OTP_SECRET);

  // Send the OTP to the user's email (or phone number, etc.)
  // ...

  // Return a response indicating success
  //res.json({ success: true, message: 'OTP sent successfully' });
     console.log(`OTP for user ${user.id}: ${otpp}`);
  
     //
     Otp.create({ email, otp : otpp})
     .then((Otp) => {
               success=true;
               res.status(201).json({success,Otp});
             })
             .catch((error) => {
              console.log("Error hai : ",error);
              return res.status(400).json({ success: false, message: 'User not found' });
             
                 });
                 const mailOptions = {
                  from: 'parasraut821@gmail.com',
                  to: email,
                  subject: 'Reset Password OTP',
                  text: `Your OTP is ${otpp} .
                  We Appreciate You Using Our Online Food Ordering Service.`
                };
                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    console.log('Error sending email: ', error);
                  } else {
                    console.log('Email sent: ', info.response);
                  }
                });
});


// trying
//post data into actual db
app.post('/confirmation',async (req,res)=>{
  // Insert the user data into the MySQL database
  const { email,newPassword,otp} = req.body;
 await reset.create({email,newPassword,otp})
  .then((reset) => {
    success=true;
            res.status(201).json({success,reset});
          })
          .catch((error) => {
           console.log("Error hai");
              });
  const user = await customers.findOne({ where: { email } });
 if (!user) {
  return res.status(400).json({ success: false, message: 'User not found' });
  }

    // // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  

  // // Update the user's password
  user.cpassword = hashedPassword;
  user.confirmPassword = newPassword ;
  await user.save();
  // // Delete the OTP record
 res.json({ success: true, message: 'Password reset successfully' });
});

// // Reset password endpoint
// // app.post('/reset-password', async (req, res) => {
// //   const { email } = req.body;

// //   // Find the user in the MySQL database
// //   const user = await customers.findOne({ where: { email: email } });
// //   if (!user) {
// //     return res.status(400).json({ message: 'Invalid email address' });
// //   }

// //   // Generate and store the OTP for the user
// //   const otp = generateOTP();
// //   otpStore[user.id] = otp;

// //   // Create a JWT token containing the user ID and OTP
// //   const token = jwt.sign({ id: user.id, otp: otp }, OTP_SECRET);

// //   // Send the OTP to the user via email or SMS (not implemented here)
// //   console.log(`OTP for user ${user.id}: ${otp}`);

// //   // Return the JWT token to the client
// //   res.json({ token });
// // });


 /*  ************************* Food Items **************************** */ 
app.post('/itempost', async  (req, res) => {
  var success=false;
 
  const { name, img , price,barcode} = req.body;
 
  items.create({ name, img , price ,barcode})
  .then((customers) => {
    success=true;
            res.status(201).json({success,items});
          })
          .catch((error) => {
           console.log("Error hai :",error);
              });
 
});


// get food data data 
const con = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:"root123",
    database:'digicart'
})

con.connect((err)=>{
    if(err){
        console.log(err);
    }else{
        console.log("Database Connected DigiCart !!")
    }
})
app.get('/getitemdigicart', async (req,res)=>{
    const id = req.body.id;
  await  con.query('select * from items',function(err,result,fields){
        if(err){
            console.log(err);
        }else{
         //res.send(result);
         var r = JSON.parse(JSON.stringify(result)) // JSON must be capital
         global.Food_items = r ;
        //  console.log(global.Food_items);
      //  console.log(r);
        }
        res.send(global.Food_items);
    })
  
})


// /* ****************************** ORDER BY USER **********************/



app.post('/myorders', async (req, res) => {
  try {
    let { userEmail, orderData, orderDate } = req.body;

    orderData = JSON.stringify(orderData);
    // Create a new order document
    const order = await Order.create({
      userEmail,
      orderData,
      orderDate
    });

    res.status(200).json({ message: 'Order saved successfully!', order: order.toJSON() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving order details!' });
  }
});


//get data
app.post('/digiorders', async (req,res)=>{
  const userEmail = req.body.userEmail;
await  con.query(`select * from orders where userEmail='${userEmail}'`,function(err,result,fields){
      if(err){
          console.log(err);
      }else{
       //res.send(result);
       var p = JSON.parse(JSON.stringify(result)) // JSON must be capital
       global.digiItems = p ;
      //  console.log(global.Food_items);
    //  console.log(r);
      }
      res.send(global.digiItems);
  })

})


//send mail to orders
app.post('/send-email', (req, res) => {
  const userEmail = req.body.userEmail;
  const orderData = req.body.orderData;
  const orderDate = req.body.orderDate;

  // create a transporter object to send the email




  
  // set up the email content
  const mailOptions = {
    from: 'parasraut821@gmail.com',
    to: userEmail,
    subject: `Your order on ${orderDate}`,
    html: `
    <h3>Your order on ${orderDate}:</h3>
    ${orderData}
  `,
  };

  // send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('Error sending email cvd: ', error);
    res.status(500).send('Error sending email');
  } else {
    console.log('Email sent: ', info.response);
    res.status(200).send('Email sent successfully');
  }
});
})


//get orders from admin
app.post('/admin', async (req,res)=>{
  const userEmail = req.body.userEmail;
await  con.query(`select * from orders where userEmail='${userEmail}'`,function(err,result,fields){
      if(err){
          console.log(err);
      }else{
       //res.send(result);
       var p = JSON.parse(JSON.stringify(result)) // JSON must be capital
      
      //  console.log(global.Food_items);
    //  console.log(r);
      }
      res.send(p);
  })
})
const port = process.env.PORT || 8080;

  // Start the express app
  app.listen(8080, () => {
    console.log('Server started on port 8080');
  });