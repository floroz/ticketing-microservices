import express from 'express';
import cookieSession from 'cookie-session';
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandlerMiddlewere } from './middlewares/errors';
import { NotFoundError } from './errors/not-found-error';
import mongoose from 'mongoose';
import { DatabaseConnectionError } from './errors/database-connection-error';

const port = 3000;

if (process.env.JWT_SECRET == null) {
  throw new Error('JWT_PRIVATE must be defined')
} else {
  console.log('JWT Secret loaded.')
}

const app = express();

// Trusting the ingress-nginx proxy
app.set('trust proxy', true);

app.use(cookieSession({
  name: 'session',
  signed: false,
  // secure: true,
}));

app.use(express.json());

app.get('/api/users/ping', (_, res) => {
  res.send('pong');
});

app.use('/api/users', currentUserRouter);
app.use('/api/users', signinRouter);
app.use('/api/users', signoutRouter);
app.use('/api/users', signupRouter);

app.use('*', () => { 
  throw new NotFoundError();
});

app.use(errorHandlerMiddlewere);

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://auth-mongo-srv:27017/auth')
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error(error);
    throw new DatabaseConnectionError();
  }
};

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
});

connectDB();