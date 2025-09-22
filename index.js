import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import authRoutes from './routes/authRoutes/authRoutes.js';
import mfaRoutes from './routes/mfaRoutes/2faroutes.js';
import companyRoutes from './routes/companyRoutes/company.routes.js';
import walletRoutes from './routes/walletRoutes/wallet.routes.js';
import { paystackwebhook } from './controllers/wallet/wallet.controller.js';
import googleSignInRoutes from './routes/googleSignin/google.signin.js';
import cors from 'cors';
const app = express();


const port = process.env.PORT || 3000;

//for webhook
app.post(
  "/api/flowpense/paystack/webhook",
  express.raw({ type: "application/json" }),
  paystackwebhook
);

app.use(express.json());


const allowedOrigins =[
  process.env.FRONTEND_URL,
  "http://localhost:3000",
]  

const corsOptions = {
 origin: function (origin, callback) {
      console.log("🌐 Incoming origin:", origin);  

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    credentials: true,
}

app.use(cors(corsOptions));


app.use('/api/auth', authRoutes);

app.use('/api/mfa', mfaRoutes);

app.use('/api/companies', companyRoutes);

app.use('/wallet', walletRoutes);

app.use('/auth', googleSignInRoutes);

app.get('/', (req, res) => {
    res.json({message: "Welcome to Flowpense API"});
});




app.listen(port, () => {
    console.log(`server is listening at http://localhost:${port}`);
});