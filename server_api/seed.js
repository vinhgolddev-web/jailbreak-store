const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const GachaCase = require('./models/GachaCase');
const SecretItem = require('./models/SecretItem');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.info('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ DB Error:', err);
        process.exit(1);
    }
};

const importData = async () => {
    // Safety Check for Production
    if (process.env.NODE_ENV === 'production' && !process.argv.includes('--force')) {
        console.error('🚨 DANGER: You are attempting to run SEED in PRODUCTION.');
        console.error('This will WIPE all Gacha Cases and Secret Items.');
        console.error('To proceed, run: node server_api/seed.js --force');
        process.exit(1);
    }

    await connectDB();

    try {
        // Read JSONs from root (parent of server_api)
        const rootDir = path.join(__dirname, '../');
        const casesData = JSON.parse(fs.readFileSync(path.join(rootDir, 'gachacases.json'), 'utf-8'));
        const secretData = JSON.parse(fs.readFileSync(path.join(rootDir, 'secretitems.json'), 'utf-8'));

        console.info('🧹 Clearing old data...');
        await GachaCase.deleteMany({});
        await SecretItem.deleteMany({});

        console.info('📦 Importing Gacha Cases...');
        await GachaCase.insertMany(casesData);

        console.info('💎 Importing Secret Items...');
        await SecretItem.insertMany(secretData);

        console.info('✅ Data Imported Successfully!');
        process.exit();
    } catch (err) {
        console.error('Error with data import:', err);
        process.exit(1);
    }
};

importData();
