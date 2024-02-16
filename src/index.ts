import express from 'express';

const app = express();
const port = 8000;

app.get('/', (req: express.Request, res: express.Response) => {
    res.json({message: " sdad"})
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
