import { baseApi } from "../../../../app/baseApi";

export type RecurrenceRule = "daily" | "weekdays" | "weekly" | "biweekly" | "monthly";

export type TaskItem = {
  id: string;
  key: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | "critical";
  status: "backlog" | "in-progress" | "in-review" | "done";
  storyPoints: number | null;
  channelId: string | null;
  dueDate: string | null;
  reminderAt: string | null;
  reminderNotifiedAt: string | null;
  recurrenceRule: RecurrenceRule | null;
  nextRecurrenceAt: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignees: { id: string; userId: string; user: { id: string; name: string; image: string | null } }[];
  labels: { id: string; taskId: string; label: string }[];
  createdBy: { id: string; name: string };
};

export type CreateTaskPayload = {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  status?: "backlog" | "in-progress" | "in-review" | "done";
  storyPoints?: number;
  dueDate?: string;
  reminderAt?: string;
  recurrenceRule?: RecurrenceRule;
  channelId?: string;
  assigneeIds?: string[];
  labels?: string[];
};

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query<TaskItem[], { status?: string; page?: number; limit?: number }>({
      query: (params) => ({ url: "/tasks", method: "GET", params }),
      transformResponse: (res: { data: TaskItem[] }) => res.data,
      providesTags: ["Tasks"],
    }),
    getTask: build.query<TaskItem, string>({
      query: (id) => ({ url: `/tasks/${id}`, method: "GET" }),
    }),
    createTask: build.mutation<TaskItem, CreateTaskPayload>({
      query: (body) => ({ url: "/tasks", method: "POST", body }),
      invalidatesTags: ["Tasks"],
    }),
    updateTask: build.mutation<TaskItem, { id: string } & Partial<CreateTaskPayload>>({
      query: ({ id, ...body }) => ({ url: `/tasks/${id}`, method: "PUT", body }),
      invalidatesTags: ["Tasks"],
    }),
    deleteTask: build.mutation<void, string>({
      query: (id) => ({ url: `/tasks/${id}`, method: "DELETE" }),
      invalidatesTags: ["Tasks"],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
