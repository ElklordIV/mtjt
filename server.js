import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import session from 'express-session';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import serverless from 'serverless-http';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.static(join(__dirname, 'public')));

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Define User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String
});
const User = mongoose.model('User', userSchema);

// Define Product Schema and Model with page
const productSchema = new mongoose.Schema({
    label: String,
    info: String,
    details: String,
    price: Number,
    imageUrl: String,
    category: String,
    page: String
});
const Product = mongoose.model('Product', productSchema);

// Define Order Schema and Model
const orderSchema = new mongoose.Schema({
    email: String,
    firstName: String,
    lastName: String,
    address: {
        street: String,
        city: String,
        province: String,
        zipCode: String,
        country: String
    },
    cart: [{ label: String, price: Number, quantity: Number }],
    totalAmount: Number,
    deliveryType: String,
    paymentReference: String
});
const Order = mongoose.model('Order', orderSchema);

// User Sign-Up Endpoint
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// User Login Endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.userId = user._id; // Set session
        res.status(200).json({ message: 'Logged in successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Customer Sign-Up Endpoint
app.post('/api/auth/signupCustomer', async (req, res) => {
    console.log('Received sign-up request:', req.body);
    try {
        const { username, lastName, email, phone, address, city, state, zipCode, password, confirmPassword } = req.body;
        
        if (password !== confirmPassword) {
            console.log('Passwords do not match');
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // Check if email or username already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            console.log('Username or email already taken');
            return res.status(400).json({ error: 'Username or email already taken' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            lastName,
            email,
            phone,
            address: { street: address, city, state, zipCode },
            password: hashedPassword
        });
        
        await newUser.save();
        console.log('User saved successfully:', newUser);
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Customer Login Endpoint
app.post('/api/auth/loginCustomer', async (req, res) => {
    console.log('Received login request:', req.body);
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            console.log('Invalid credentials');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.userId = user._id; // Set session
        console.log('Logged in successfully:', user);
        res.status(200).json({ message: 'Logged in successfully' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: error.message });
    }
});

// User Logout Endpoint
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

// Add Product Endpoint
app.post('/api/products', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update Product Endpoint
app.put('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedProduct = await Product.findByIdAndUpdate(productId, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete Product Endpoint
app.delete('/api/products/:id', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const productId = req.params.id;
        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) throw new Error('Product not found.');
        res.json(deletedProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get Products by Page Endpoint
app.get('/api/products/:page', async (req, res) => {
    try {
        const page = req.params.page;
        const products = await Product.find({ page }); // Filter products by the selected page
        res.json(products);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get All Products Endpoint
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get Products by Category Endpoint
app.get('/api/products/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const products = await Product.find({ category: new RegExp(category, 'i') });
        res.json(products);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Search Orders by Payment Reference Endpoint
app.get('/api/orders/search', async (req, res) => {
    try {
        const { paymentReference } = req.query;
        if (!paymentReference) {
            return res.status(400).json({ error: 'Payment reference is required' });
        }
        const order = await Order.findOne({ paymentReference });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Order Endpoint
app.post('/api/orders', async (req, res) => {
    try {
        const { email, firstName, lastName, address, cart, totalAmount, deliveryType, paymentReference } = req.body;
        const newOrder = new Order({
            email,
            firstName,
            lastName,
            address,
            cart,
            totalAmount,
            deliveryType,
            paymentReference // Save the payment reference received from client
        });
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Paystack Callback Endpoint
app.post('/paystack/callback', async (req, res) => {
    try {
        // Handle Paystack callback and update order status
        console.log('Paystack callback received:', req.body);
        res.status(200).send('Callback received');
    } catch (error) {
        console.error('Error handling Paystack callback:', error);
        res.status(500).json({ error: error.message });
    }
});

// Export the serverless handler
export const handler = serverless(app);

// Connect to MongoDB
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit process with failure
    }
}

startServer(); // Call the async function to connect to MongoDB and start the server
