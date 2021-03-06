export interface IScorecardTemplate {
  ID: number;
  Title: string;
  Tooltip: string;
}

export interface ISPRequest {
    data: {};
    url: string;
    type: string;
    listName: string;
}
export interface IScorecard {
  task: string;
  milestone: string;
  submilestones: string;
  taskID: number;
  assignedToID: number;
  assignedTo: string;
  assignedToSkill: string;
  taskCompletionDate: Date;
  documentUrl: string;
  reviewTaskDocUrl: string;
  reviewTask: string;
  selectedTemplate: {
    ID: number,
    Title: string,
    tooltip: string,
  };
  templateMatrix: Array<{
    question: string,
    questionId: number,
    rating: number,
    tooltip: string
  }>;
  averageRating: number;
  feedbackComment: string;
  ignoreFeedback: boolean;
}

export interface IAverageRatings {
    name: string;
    value: string;
    rating: number;
    count: number;
}
