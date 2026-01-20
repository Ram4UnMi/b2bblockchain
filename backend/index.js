const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Simple route for testing
app.get('/', (req, res) => {
    res.send('B2B Blockchain Backend is running!');
});

// Database connection (replace with your MongoDB connection string)
mongoose.connect('mongodb://localhost:27017/b2b-blockchain', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
