require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api', apiRoutes);

// Health check route
app.get('/', (req, res) => {
    res.send('Backend server is running.');
});

// Sync database and start server
db.sequelize.sync().then(() => {
    console.log('Database connected and synchronized.');
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to sync database: ', err);
});
