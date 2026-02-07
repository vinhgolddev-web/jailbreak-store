const mongoose = require('mongoose');
const dotenv = require('dotenv');
const GachaCase = require('./models/GachaCase');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedGacha = async () => {
    try {
        await GachaCase.deleteMany();

        await GachaCase.create([
            {
                name: 'Hòm Cơ Bản',
                price: 50000,
                image: 'https://static.wikia.nocookie.net/jailbreak/images/0/07/Concept.png', // Placeholder
                items: [
                    { name: '10,000 Cash', image: 'https://tr.rbxcdn.com/7d363b36449171728109d437ce21c322/150/150/Image/Png', rarity: 'Common', probability: 50 },
                    { name: '20,000 Cash', image: 'https://tr.rbxcdn.com/7d363b36449171728109d437ce21c322/150/150/Image/Png', rarity: 'Uncommon', probability: 30 },
                    { name: 'Skin Pixel', image: 'https://static.wikia.nocookie.net/jailbreak/images/a/a9/Pixel.png', rarity: 'Rare', probability: 15 },
                    { name: 'Volt Bike', image: 'https://static.wikia.nocookie.net/jailbreak/images/1/18/Volt.png', rarity: 'Legendary', probability: 5 }
                ]
            },
            {
                name: 'Hòm Siêu Cấp',
                price: 200000,
                image: 'https://static.wikia.nocookie.net/jailbreak/images/b/b8/HyperChrome_Level_5.png', // Placeholder
                items: [
                    { name: '50,000 Cash', image: 'https://tr.rbxcdn.com/7d363b36449171728109d437ce21c322/150/150/Image/Png', rarity: 'Common', probability: 40 },
                    { name: 'BlackHawk', image: 'https://static.wikia.nocookie.net/jailbreak/images/6/6f/BlackHawk.png', rarity: 'Epic', probability: 30 },
                    { name: 'Concept Car', image: 'https://static.wikia.nocookie.net/jailbreak/images/0/07/Concept.png', rarity: 'Legendary', probability: 20 },
                    { name: 'HyperChrome Lvl 5', image: 'https://tr.rbxcdn.com/186ace805174092408b49dbb4e54826b/420/420/Image/Png', rarity: 'HyperChrome', probability: 10 }
                ]
            }
        ]);

        console.log('Gacha Data Seeded!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedGacha();
