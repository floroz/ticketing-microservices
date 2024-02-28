import express, { Request, Response } from 'express';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/api/users/currentuser', (req: Request, res: Response) => {
  res.send('Hello, Mars!!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});