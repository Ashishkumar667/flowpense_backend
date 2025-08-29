import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import authRoutes from './routes/authRoutes/authRoutes.js'
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());


app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({message: "Welcome to Flowpense API"});
});




app.listen(port, () => {
    console.log(`server is listening at http://localhost:${port}`);
});