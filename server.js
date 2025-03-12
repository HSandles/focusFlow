const express = require('express');
const sequelize = require('./config/db'); // ✅ Import Sequelize instance
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const taskRoutes = require('./routes/tasks');
require('dotenv').config();

// ✅ Import models (moved from db.js)
const User = require('./models/User');
const Task = require('./models/Task');

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 5000;

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully!');

        await sequelize.sync({ force: false }); // ✅ Sync models with DB
        console.log('✅ Tables synced!');

        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (error) {
        console.error('❌ Database connection error:', error);
    }
})();

