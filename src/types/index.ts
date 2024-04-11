export interface TaskType {
    id: string;
    completed: boolean;
    text: string;
    createdDate?: string | null;
    completedDate?: string | null;
}