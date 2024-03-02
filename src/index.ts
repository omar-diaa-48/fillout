import axios from "axios";
import dayjs from "dayjs";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import { FillOutFormSubmissionResponse, FillOutFormSubmissionResponsesData, ResponseFiltersType } from "./interfaces";
import { getFillOutUrl } from "./utilities";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get("/:formId/filteredResponses", async (req: Request, res: Response) => {
    const formId = req.params.formId;
    const query = req.query;

    const limit: number = query.limit ? !isNaN(parseInt(query.limit + '')) ? parseInt(query.limit + '') : 150 : 150;
    const offset: number = query.offset ? !isNaN(parseInt(query.offset + '')) ? parseInt(query.offset + '') : 0 : 0;

    const status = query.status;
    const sort = query.sort;
    const afterDate = query.afterDate;
    const beforeDate = query.beforeDate;

    const filters: ResponseFiltersType = query.filters ? JSON.parse(JSON.stringify(query.filters)) : [];

    try {
        if (!formId) {
            return res.status(400).send('Unable to get filtered responses for this form')
        }

        const url = `${getFillOutUrl()}/api/forms/${formId}/submissions`

        console.log('Getting filtered responses for form ', url);

        const params: Record<string, any> = {
            limit,
            offset
        }

        if (afterDate) {
            params.afterDate = afterDate
        }

        if (beforeDate) {
            params.beforeDate = beforeDate
        }

        if (status) {
            params.status = status
        }

        if (sort) {
            params.sort = sort
        }

        const response = await axios.get<FillOutFormSubmissionResponsesData>(url, {
            headers: {
                'Authorization': `Bearer ${process.env.FILL_OUT_API_KEY}`
            },
            params
        });

        const data = response.data;

        const filteredResponses: FillOutFormSubmissionResponse[] = data.responses.filter((submission) => {
            // Iterate over filters
            return filters.every((filter) => {
                // Check if the question with matching id exists in the response
                const question = submission.questions.find((q) => q.id === filter.id);

                if (question) {
                    // Apply condition check based on the filter, avoid strict data type validation in comparison
                    const valueType = !isNaN(parseFloat(question.value)) ? "number" : dayjs(question.value).isValid() ? "date" : "string"

                    switch (filter.condition) {

                        case "equals":
                            if (valueType === "date") {
                                return dayjs(question.value).isSame(filter.value)
                            }

                            return question.value == filter.value;


                        case "does_not_equal":
                            if (valueType === "date") {
                                return !dayjs(question.value).isSame(filter.value)
                            }

                            return question.value != filter.value;


                        case "greater_than":
                            switch (valueType) {
                                case "date":
                                    return dayjs(question.value).isAfter(filter.value)
                                case "number":
                                    return question.value > filter.value
                                case "string":
                                default:
                                    return false
                            }


                        case "less_than":
                            switch (valueType) {
                                case "date":
                                    return dayjs(question.value).isBefore(filter.value)
                                case "number":
                                    return question.value < filter.value
                                case "string":
                                default:
                                    return false
                            }


                        default:
                            return false;

                    }
                }

                // If question with filter id not found, return false
                return false;
            });
        });

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