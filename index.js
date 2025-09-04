import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import authRoutes from './routes/authRoutes/authRoutes.js';
import mfaRoutes from './routes/mfaRoutes/2faroutes.js';
import companyRoutes from './routes/companyRoutes/company.routes.js';
import walletRoutes from './routes/walletRoutes/wallet.routes.js';
import { stripeWebhook } from './controllers/wallet/wallet.controller.js';
const app = express();

const port = process.env.PORT || 3000;

//for webhook
app.post(
  "/api/flowpense/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);


app.use(express.json());


app.use('/api/auth', authRoutes);

app.use('/api/mfa', mfaRoutes);

app.use('/api/companies', companyRoutes);

app.use('/wallet', walletRoutes);

app.get('/', (req, res) => {
    res.json({message: "Welcome to Flowpense API"});
});




app.listen(port, () => {
    console.log(`server is listening at http://localhost:${port}`);
});