import { FillOutFormSubmissionResponse, ResponseFiltersType } from "../interfaces";
import { getFilteredResponses } from "../utilities";

describe('getFilteredResponses function', () => {
    const responses: FillOutFormSubmissionResponse[] = [
        {
            submissionId: '1',
            submissionTime: '2024-01-01',
            lastUpdatedAt: '2024-01-01',
            questions: [
                {
                    id: "nameId",
                    name: "What's your name?",
                    type: "ShortAnswer",
                    value: "Timmy"
                },
                {
                    id: "birthdayId",
                    name: "What is your birthday?",
                    type: "DatePicker",
                    value: "2024-02-22T05:01:47.691Z"
                },
            ],
            calculations: [],
            urlParameters: [],
            quiz: [],
            documents: []
        },
    ];

    const filters_1: ResponseFiltersType = [
        {
            id: "nameId",
            condition: "equals",
            value: "Timmy",
        }
    ];

    it('should return filtered responses based on provided filters', () => {
        const filteredResponses = getFilteredResponses(responses, filters_1);

        expect(filteredResponses.length).toBe(1);
        expect(filteredResponses[0].submissionId).toBe('1')
    });

    const filters_2: ResponseFiltersType = [
        {
            id: "nameId",
            condition: "equals",
            value: "Timmy",
        },
        {
            id: "birthdayId",
            condition: "greater_than",
            value: "2024-02-23T05:01:47.691Z"
        }
    ]

    it('should return empty filtered responses based on provided filters that does not meet', () => {
        const filteredResponses = getFilteredResponses(responses, filters_2);

        expect(filteredResponses.length).toBe(0);
    });
});