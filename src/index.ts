import axios from "axios";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import { FillOutFormSubmissionResponsesData, ResponseFiltersType } from "./interfaces";
import { getFillOutUrl, getFilteredResponses, getParamsFromRequest } from "./utilities";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get("/:formId/filteredResponses", async (req: Request, res: Response) => {
    const formId = req.params.formId;
    const query = req.query;

    const [limit, _, params] = getParamsFromRequest(req.query)
    const filters: ResponseFiltersType = query.filters ? JSON.parse(JSON.stringify(query.filters)) : [];

    try {
        if (!formId) {
            return res.status(400).send('Unable to get filtered responses for this form')
        }

        const url = `${getFillOutUrl()}/api/forms/${formId}/submissions`

        console.log('Getting filtered responses for form ', url);

        const response = await axios.get<FillOutFormSubmissionResponsesData>(url, {
            headers: {
                'Authorization': `Bearer ${process.env.FILL_OUT_API_KEY}`
            },
            params
        });

        const data = response.data;

        const filteredResponses = getFilteredResponses(data.responses, filters)

        res.json({
            responses: filteredResponses,
            totalResponses: filteredResponses.length,
            pageCount: Math.ceil(filteredResponses.length / limit)
        });
    } catch (error) {
        console.error(error)
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