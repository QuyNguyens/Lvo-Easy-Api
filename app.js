require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const topicRoutes = require('./routes/topicRoutes');
const vocabRoutes = require('./routes/vocabRoutes');
const vocabStatusRoutes = require('./routes/vocabStatusRoutes');

const responseMiddleWare = require('./middleware/responseMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(responseMiddleWare);

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/api/users', userRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/vocab', vocabRoutes);
app.use('/api/vocabStatus', vocabStatusRoutes);

app.listen(PORT, () => {
    console.log(`server on running on http://localhost:${PORT}`);
});