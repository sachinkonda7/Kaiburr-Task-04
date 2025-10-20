import axios from "axios";
import type {
  ExecutionResponse,
  Task,
  TaskPayload,
} from "@/types/task";

const baseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081/api"
).replace(/\/+$/, "");

const http = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export const taskService = {
  async list(): Promise<Task[]> {
    const { data } = await http.get<Task[]>("/tasks");
    return data;
  },

  async search(name?: string): Promise<Task[]> {
    const params = name ? { name } : undefined;
    const { data } = await http.get<Task[]>("/tasks/search", { params });
    return data;
  },

  async get(id: string): Promise<Task> {
    const { data } = await http.get<Task>(`/tasks/${id}`);
    return data;
  },

  async create(payload: TaskPayload): Promise<Task> {
    const { data } = await http.post<Task>("/tasks", payload);
    return data;
  },

  async update(id: string, payload: TaskPayload): Promise<Task> {
    const { data } = await http.put<Task>(`/tasks/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/tasks/${id}`);
  },

  async execute(id: string): Promise<ExecutionResponse> {
    const { data } = await http.put<ExecutionResponse>(
      `/tasks/${id}/execute`,
    );
    return data;
  },
};

export interface ApiErrorInfo {
  message: string;
  fieldErrors?: Record<string, string>;
  status?: number;
}

export function toApiError(error: unknown): ApiErrorInfo {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | string | undefined;
    const status = error.response?.status;

    if (typeof data === "string") {
      return { message: data, status };
    }

    if (data && typeof data === "object") {
      const detailCandidates = [
        data.detail,
        data.message,
        data.title,
      ].filter(
        (value): value is string =>
          typeof value === "string" && value.length > 0,
      );
      const detail = detailCandidates[0];

      const errors =
        data.errors && typeof data.errors === "object"
          ? Object.fromEntries(
              Object.entries(data.errors).map(([key, value]) => [
                key,
                Array.isArray(value) ? value.join(", ") : String(value),
              ]),
            )
          : undefined;

      return {
        message: detail ?? error.message,
        fieldErrors: errors,
        status,
      };
    }

    return { message: error.message, status };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "Unexpected error occurred" };
}
