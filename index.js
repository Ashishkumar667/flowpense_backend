import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import authRoutes from './routes/authRoutes/authRoutes.js';
import mfaRoutes from './routes/mfaRoutes/2faroutes.js';
import companyRoutes from './routes/companyRoutes/company.routes.js';
import walletRoutes from './routes/walletRoutes/wallet.routes.js';
import { pagaWebhook } from './controllers/wallet/wallet.controller.js';
import googleSignInRoutes from './routes/googleSignin/google.signin.js';
import cardManagementRoutes from './routes/cardManagementRoutes/card.management.routes.js';
import expenseRoutes from './routes/ExpenseRoutes/expense.routes.js';
import fundRoutes from './routes/fundingRoutes/fund.routes.js';
import approvalRoutes from './routes/ApprovalRoutes/approve.routes.js';
import teamMemberRoutes from './routes/TeamMemberRoutes/team.member.js';
import userKYCRoutes from './routes/userKYCRoutes/user.kyc.routes.js';
import reqFundCardRoutes from './routes/ReqForFundingRoutes/req.fund.js';
import approvalReqRoutes from './routes/ReqForFundingRoutes/approvalRoutes/req.approval.routes.js';
import bankRoutes from './routes/BankRoutes/bank.routes.js';
import notificationRoutes from './routes/notification/notification.js';
import cors from 'cors';
const app = express();


const port = process.env.PORT || 3000;

//for webhook
app.post(
  "/api/flowpense/paga/webhook",
  express.raw({ type: "application/json" }),
  pagaWebhook
);

app.use(express.json());


const allowedOrigins =[
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "https://flowpense.vercel.app",
  "https://flowpense.funtech.dev"
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
    methods: ['GET', 'PUT', 'POST', 'DELETE','PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'platform'],
    exposedHeaders: ['Authorization'],
    credentials: true,
}

app.use(cors(corsOptions));



app.use('/api/auth', authRoutes);

app.use('/api/mfa', mfaRoutes);

app.use('/api/cards', cardManagementRoutes);

app.use('/api/expenses', expenseRoutes);

app.use('/api/userkyc', userKYCRoutes);

app.use('/api/approvals', approvalRoutes);

app.use('/api/funds', fundRoutes);

app.use('/api/all', bankRoutes);

app.use('/api/req/fund', reqFundCardRoutes);

app.use('/api/req/approval', approvalReqRoutes);

app.use('/api/teams', teamMemberRoutes);

app.use('/api/companies', companyRoutes);

app.use('/wallet', walletRoutes);

app.use('/auth', googleSignInRoutes);

app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.json({message: "Welcome to Flowpense API"});
});




app.listen(port, () => {
    console.log(`server is listening at http://localhost:${port}`);
});