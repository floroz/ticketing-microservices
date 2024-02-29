
import { Request, Response, Router } from 'express';

const router = Router();

router.get('/current-user', (req: Request, res: Response) => {
  res.send('Hello, world!!');
});

export { router as currentUserRouter };