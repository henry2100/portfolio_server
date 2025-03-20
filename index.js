const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRouter');
const contactMssgsRoutes = require('./routes/contactMssgRouter');
const skillsRoutes = require('./routes/skillRouter');
const serviceRoutes = require('./routes/serviceRouter');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3002;

console.log('Port:', process.env.PORT);

// Function to set up middleware
const configureMiddleware = (app) => {
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Set up session management
    const sessionOptions = {
        secret: process.env.JWT_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URL,
            ttl: 24 * 60 * 60, // 1 day
            autoRemove: 'native',
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
        },
    };
    app.use(session(sessionOptions));
};

// Function to connect to MongoDB
const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); // Exit the process if the database connection fails
    }
};

// Fallback error handler
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
};

// Configure middleware
configureMiddleware(app);

// Define routes
app.use('/api/users', userRoutes);
app.use('/api/contact_requests', contactMssgsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/services', serviceRoutes);

// Global error handler
app.use(errorHandler);

// Start the server after connecting to MongoDB
const startServer = async () => {
    await connectToMongoDB();
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
};

// Run the server
startServer();



















// const express = require('express');
// const http = require('http');
// const https = require('https');
// const session = require('express-session');
// const MongoStore = require('connect-mongo');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const userRoutes = require('./routes/userRouter');
// const contactMssgsRoutes = require('./routes/contactMssgRouter');

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 3000;


// //Middleware-Setup
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({
//     extended: false
// }));


// // Set up session management
// app.use(session({
//     secret: process.env.JWT_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({
//         mongoUrl: process.env.MONGO_URL,
//         ttl: 24 * 60 * 60,
//         autoRemove: 'native',
//     }),
//     cookie: {
//         maxAge: 1000 * 60 * 60 * 24,
//         secure: process.env.NODE_ENV === 'production',
//         httpOnly: true,
//     }
// }));


// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URL)
//     .then(() => {
//         console.log('Connected to MongoDB');
//         app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
//     })
//     .catch(err => {
//         console.error('Failed to connect to MongoDB', err);
//         process.exit(1);
//     });


// // route usage
// app.use("/api/users", userRoutes);
// app.use("/api/contactRequests", contactMssgsRoutes);


// // Logging credentials (make sure this is only for development and removed in production)
// // if (process.env.NODE_ENV !== 'production') {
// //     console.log("Email_credentials:", {
// //         email: process.env.EMAIL_USER,
// //         password: process.env.EMAIL_PASS,
// //     });
// // }
