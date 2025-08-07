require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');


app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Adjust this to your frontend's URL
  credentials: true
}));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

