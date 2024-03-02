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
    try {
        if (!formId) {
            return res.status(400).send('Unable to get filtered responses for this form')
        }

        const filters: ResponseFiltersType = [
            { id: "4KC356y4M6W8jHPKx9QfEy", condition: "equals", value: "Nothing much to share yet!" },
            { id: "bE2Bo4cGUv49cjnqZ4UnkW", condition: "equals", value: "Johnny" },
        ]

        const url = `${getFillOutUrl()}/api/forms/${formId}/submissions`

        console.log('Getting filtered responses for form ', url);

        const response = await axios.get<FillOutFormSubmissionResponsesData>(url, {
            headers: {
                'Authorization': `Bearer ${process.env.FILL_OUT_API_KEY}`
            }
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

        res.json(filteredResponses);
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