import dayjs from "dayjs";
import { FillOutFormSubmissionResponse, ResponseFiltersType } from "../interfaces";

export const getFillOutUrl = (): string => `${process.env.FILL_OUT_API_BASE_URL}/${process.env.FILL_OUT_API_VERSION}`

export const getParamsFromRequest = (query: Record<string, any>): [number, number, Record<string, any>] => {
    const limit: number = query.limit ? !isNaN(parseInt(query.limit + '')) ? parseInt(query.limit + '') : 150 : 150;
    const offset: number = query.offset ? !isNaN(parseInt(query.offset + '')) ? parseInt(query.offset + '') : 0 : 0;

    const status = query.status;
    const sort = query.sort;
    const afterDate = query.afterDate;
    const beforeDate = query.beforeDate;

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

    return [limit, offset, params];
}

export const getFilteredResponses = (responses: FillOutFormSubmissionResponse[], filters: ResponseFiltersType): FillOutFormSubmissionResponse[] => {
    const filteredResponses: FillOutFormSubmissionResponse[] = responses.filter((submission) => {
        // Iterate over filters
        return filters.every((filter) => {
            // Check if the question with matching id exists in the response
            const question = submission.questions.find((q) => q.id === filter.id);

            if (question) {
                // Apply condition check based on the filter, avoid strict data type validation in comparison
                const valueType =
                    dayjs(question.value, 'YYYY-MM-DD').isValid() && dayjs(filter.value, 'YYYY-MM-DD').isValid() ? "date"
                        : !isNaN(parseFloat(question.value)) && !isNaN(parseFloat(filter.value + '')) ? "number"
                            : "string"

                switch (filter.condition) {

                    case "equals":
                        if (valueType === "date") {
                            return dayjs(question.value, 'YYYY-MM-DD').isSame(dayjs(filter.value, 'YYYY-MM-DD'))
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
                                return dayjs(question.value, 'YYYY-MM-DD').isAfter(dayjs(filter.value, 'YYYY-MM-DD'))
                            case "number":
                                return parseFloat(question.value) > parseFloat(filter.value + '')
                            case "string":
                            default:
                                return false
                        }


                    case "less_than":
                        switch (valueType) {
                            case "date":
                                return dayjs(question.value, 'YYYY-MM-DD').isBefore(dayjs(filter.value, 'YYYY-MM-DD'))
                            case "number":
                                return parseFloat(question.value) < parseFloat(filter.value + '')
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

    return filteredResponses;
}