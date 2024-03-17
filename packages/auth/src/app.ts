
import express from 'express';
import cookieSession from 'cookie-session';
import { errorHandlerMiddlewere } from '@ticketing/common';
import { NotFoundError } from '@ticketing/common';
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';

import morgan from 'morgan';

const app = express();

app.use(morgan('dev'));

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

export { app };