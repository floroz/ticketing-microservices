import express from 'express';
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandlerMiddlewere } from './middlewares/errors';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/api/users/ping', (_, res) => {
  res.send('pong');
});
app.use('/api/users', currentUserRouter);
app.use('/api/users', signinRouter);
app.use('/api/users', signoutRouter);
app.use('/api/users', signupRouter);

app.use(errorHandlerMiddlewere);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});