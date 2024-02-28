
import { Request, Response, Router } from 'express';

const router = Router();

router.post('/signin', (req: Request, res: Response) => {
  // Your endpoint logic goes here
  res.send('Hello, world!');
});

export { router as signinRouter };