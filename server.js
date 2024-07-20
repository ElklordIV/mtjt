import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/payment.html', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'payment.html'));
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: 'thabangelklord@gmail.com',
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
    }
});

function sendEmailNotification(paymentDetails) {
    const { email, cart, totalAmount, paymentReference } = paymentDetails;
    const subject = 'New Payment Received';
    const text = `A new payment has been received.\n\nPayment Reference: ${paymentReference}\nTotal Amount: ${totalAmount}\nItems Purchased: ${JSON.stringify(cart, null, 2)}\nCustomer Email: ${email}`;

    const mailOptions = {
        from: 'thabangelklord@gmail.com',
        to: 'business-owner@example.com', // Replace with your email
        subject,
        text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

// Paystack callback endpoint
app.post('/paystack/callback', (req, res) => {
    const paymentDetails = req.body; // Assuming Paystack sends payment details in the request body
    // Store payment details in your database
    // Send email notification to business owner
    sendEmailNotification(paymentDetails);
    res.sendStatus(200); // Respond to Paystack callback
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});

// Define a Schema and Model for orders
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
    cart: Array,
    totalAmount: Number,
    paymentReference: String
});

const Order = mongoose.model('Order', orderSchema);

// Endpoint to handle new orders
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint to update order with payment reference
app.put('/api/orders/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { paymentReference: req.body.paymentReference }, { new: true });
        if (!updatedOrder) throw new Error('Order not found.');
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Serve static files from the public folder
const publicPath = join(__dirname, 'public');
app.use(express.static(publicPath));

// Handle other routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(join(publicPath, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
