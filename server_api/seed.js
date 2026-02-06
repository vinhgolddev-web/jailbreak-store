const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Transaction = require('./models/Transaction');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedData = async () => {
    try {
        await User.deleteMany();
        await Product.deleteMany();
        await Order.deleteMany();
        await Transaction.deleteMany();

        // Create Admin User
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);

        await User.create({
            username: 'Admin',
            email: 'admin@jailbreak.com',
            password: adminPassword,
            role: 'admin',
            balance: 1000000000 // Infinite money for admin testing
        });

        await Product.insertMany([
            {
                name: 'Concept Car',
                price: 2500000,
                image: 'https://static.wikia.nocookie.net/jailbreak/images/0/07/Concept.png',
                category: 'Vehicle',
                rarity: 'Legendary',
                stock: 5
            },
            {
                name: 'HyperChrome Level 5',
                price: 1000000,
                image: 'https://tr.rbxcdn.com/186ace805174092408b49dbb4e54826b/420/420/Image/Png',
                category: 'Skin',
                rarity: 'Godly',
                stock: 10
            },
            {
                name: 'Volt Bike',
                price: 1000000,
                image: 'https://static.wikia.nocookie.net/jailbreak/images/1/18/Volt.png',
                category: 'Vehicle',
                rarity: 'Epic',
                stock: 20
            },
            {
                name: 'BlackHawk',
                price: 1000000,
                image: 'https://static.wikia.nocookie.net/jailbreak/images/6/6f/BlackHawk.png',
                category: 'Vehicle',
                rarity: 'Epic',
                stock: 15
            },
            {
                name: 'Pixel Texture',
                price: 500000,
                image: 'https://static.wikia.nocookie.net/jailbreak/images/a/a9/Pixel.png',
                category: 'Skin',
                rarity: 'Rare',
                stock: 50
            }
        ]);

        console.log('Data Imported!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
