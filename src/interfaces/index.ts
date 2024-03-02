export interface FillOutFormQuestion {
    id: string,
    name: string,
    type: string,
    value: string
}

export interface FillOutFormSubmissionResponse {
    submissionId: string;
    submissionTime: string;
    lastUpdatedAt: string;
    questions: FillOutFormQuestion[];
    calculations: any[];
    urlParameters: any[];
    quiz: any;
    documents: any[];
}

export interface FillOutFormSubmissionResponsesData {
    responses: FillOutFormSubmissionResponse[];
    totalResponses: number;
    pageCount: number;
}
