const mongoose = require('mongoose');

const connectDB = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        // await mongoose.connection.db.collection('topics').deleteMany({});
        // await mongoose.connection.db.collection('vocabularies').deleteMany({});
        // await mongoose.connection.db.collection('vocabularies').deleteMany({});
        
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection error: ", error.message);
        process.exit(1);
    }
}

module.exports = connectDB;