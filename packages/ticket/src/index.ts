import express, { Request, Response } from 'express';

const app = express();
const port = 3001;

app.use(express.json());

app.get('/api/ticket', (req: Request, res: Response) => {
  res.send('Hello, ticket!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});