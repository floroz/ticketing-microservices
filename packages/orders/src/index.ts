import express, { Request, Response } from 'express';

const app = express();
const port = 3002;

app.use(express.json());

app.get('/api/orders', (req: Request, res: Response) => {
  res.send('Hello, Orders!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});