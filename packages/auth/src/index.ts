
import mongoose from 'mongoose';
import { DatabaseConnectionError } from './errors/database-connection-error';
import { app } from './app';

const port = 3000;

if (process.env.JWT_SECRET == null) {
  throw new Error('JWT_SECRET must be defined')
} else {
  console.log('JWT_Secret loaded.')
}


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