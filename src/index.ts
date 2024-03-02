import axios from "axios";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import { getFillOutUrl } from "./utilities";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get("/:formId/filteredResponses", async (req: Request, res: Response) => {
    const formId = req.params.formId;
    try {
        if (!formId) {
            return res.status(400).send('Unable to get filtered responses for this form')
        }

        const url = `${getFillOutUrl()}/api/forms/${formId}/submissions`

        console.log('Getting filtered responses for form ', url);

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${process.env.FILL_OUT_API_KEY}`
            }
        });

        console.log(response.data);

        res.json([]);
    } catch (error) {
        console.table({ message: 'Unable to get filtered responses for a form ', formId, error })
        res.status(400).send('Unable to get filtered responses for this form')
    }
});

app.all('*', (req: Request, res: Response) => {
    console.table({ message: 'Unavailable API request', url: req.url, body: req.body })
    res.send('This API is unavailable at the moment')
})

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});