export interface TaskExecution {
  startTime?: string | null;
  endTime?: string | null;
  output?: string | null;
}

export interface Task {
  id: string;
  name: string;
  owner: string;
  command: string;
  lastExecution?: TaskExecution | null;
}

export interface TaskPayload {
  name: string;
  owner: string;
  command: string;
}

export interface ExecutionResponse {
  taskId: string;
  status: "SUCCESS" | "FAILED";
  exitCode: number;
  output: string;
  startTime?: string;
  endTime?: string;
}
