import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get("/:formId/filteredResponses", (req: Request, res: Response) => {
    console.log('Getting filtered responses for form ', req.params.formId);
    res.json([]);
});

app.all('*', (req: Request, res: Response) => {
    res.send('This API is unavailable at the moment')
})

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});