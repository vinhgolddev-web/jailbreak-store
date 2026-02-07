const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const GachaCase = require('./models/GachaCase');
const SecretItem = require('./models/SecretItem');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('DB Error:', err);
        process.exit(1);
    }
};

const importData = async () => {
    await connectDB();

    try {
        // Read JSONs from root (parent of server_api)
        const rootDir = path.join(__dirname, '../');
        const casesData = JSON.parse(fs.readFileSync(path.join(rootDir, 'gachacases.json'), 'utf-8'));
        const secretData = JSON.parse(fs.readFileSync(path.join(rootDir, 'secretitems.json'), 'utf-8'));

        console.log('Clearing old data...');
        await GachaCase.deleteMany({});
        await SecretItem.deleteMany({});

        console.log('Importing Gacha Cases...');
        await GachaCase.insertMany(casesData);

        console.log('Importing Secret Items...');
        await SecretItem.insertMany(secretData);

        console.log('✅ Data Imported Successfully!');
        process.exit();
    } catch (err) {
        console.error('Error with data import:', err);
        process.exit(1);
    }
};

importData();
