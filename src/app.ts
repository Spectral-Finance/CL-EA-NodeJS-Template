import express, { Request, Response } from 'express';
import { createRequest } from './index';

const app = express();
const port = 3000;

app.use(express.json());

app.post('/', async (req: Request, res: Response) => {
  try {
    const result = await createRequest(req.body);
    return res.status(result.status).json(result.data);
  } catch (err) {
    return res.status(500).json({ error: 'Server Error' });
  }
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
