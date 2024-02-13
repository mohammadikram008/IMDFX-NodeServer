// server.js
const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const connection = require("./db");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 3006;
// const router = require("./Routes/RouteLogins/User");
 const router =require('./Routes/RouteLogins/User')
app.use('/api', router);
app.use('/uploads', express.static('uploads')); 
// Connect to MongoDB
connection();




// const User = mongoose.model('User', userSchema);
// // Middleware to parse incoming JSON requests
// app.use(bodyParser.json());

// // Login endpoint
// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;

//   // Find the user by username in MongoDB
//   const user = await User.findOne({ username });

//   // If the user is not found, return an error
//   if (!user) {
//     return res.status(401).json({ error: 'Invalid username or password' });
//   }

//   // Compare the provided password with the hashed password in the database
//   const passwordMatch = await bcrypt.compare(password, user.password);

//   // If the passwords match, login successful
//   if (passwordMatch) {
//     return res.json({ message: 'Login successful' });
//   } else {
//     // If passwords do not match, return an error
//     return res.status(401).json({ error: 'Invalid username or password' });
//   }
// });

// Start the server

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
