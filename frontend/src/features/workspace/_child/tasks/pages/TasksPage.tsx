import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../../../shared/lib/utils";
import {
  Plus, MoreHorizontal, Users, AlertTriangle, UserX, CheckCircle,
  SlidersHorizontal,
} from "lucide-react";
import { useGetTasksQuery, type TaskItem } from "../../../workspaceApi";

const priorityColors: Record<TaskItem["priority"], string> = {
  critical: "bg-error-container/20 text-error",
  high: "bg-error-container/20 text-error",
  medium: "bg-tertiary-container/20 text-tertiary",
  low: "bg-secondary-container/20 text-secondary",
};

const columns: { id: TaskItem["status"]; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "in-progress", label: "In Progress" },
  { id: "in-review", label: "In Review" },
  { id: "done", label: "Done" },
];

export default function TasksPage() {
  const navigate = useNavigate();
  const { data: tasks = [], isLoading, isError } = useGetTasksQuery({});
  const [activeFilter, setActiveFilter] = useState<string>("my-tasks");

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-dim">
        <div className="text-on-surface-variant">Loading tasks...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-dim">
        <div className="bg-error-container/10 border border-error/30 rounded-lg p-6 text-center max-w-md">
          <p className="font-body-md text-body-md text-error mb-2">Failed to load tasks</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-error text-on-error rounded font-label-md text-label-md hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filters = [
    { id: "my-tasks", label: "My Tasks", icon: Users, active: true },
    { id: "high-priority", label: "High Priority", icon: AlertTriangle },
    { id: "unassigned", label: "Unassigned", icon: UserX },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface-dim">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-8 py-5">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveFilter(id)}
              className={cn(
                "px-4 py-2 rounded-lg text-label-md flex items-center gap-2 transition-colors",
                activeFilter === id
                  ? "bg-primary-container text-on-primary-container font-bold"
                  : "bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant"
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
          <div className="h-6 w-px bg-outline-variant mx-2 hidden md:block" />
          <button className="px-4 py-2 text-on-surface-variant hover:text-on-surface rounded-lg text-label-md flex items-center gap-2 transition-colors">
            <SlidersHorizontal size={14} />
            More Filters
          </button>
        </div>
        <button
          onClick={() => navigate("/tasks/create")}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg text-label-md font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
        >
          <Plus size={16} />
          Create Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto px-4 md:px-8 pb-6">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-on-surface-variant">
              <p className="font-body-md text-body-md">No tasks yet</p>
              <button
                onClick={() => navigate("/tasks/create")}
                className="mt-4 px-4 py-2 bg-primary text-on-primary rounded font-label-md text-label-md hover:opacity-90"
              >
                Create your first task
              </button>
            </div>
          </div>
        ) : (
        <div className="flex gap-6 h-full min-h-[500px]">
          {columns.map(({ id, label }) => {
            const columnTasks = tasks.filter((t) => t.status === id);
            const isDone = id === "done";

            return (
              <div
                key={id}
                className={cn(
                  "flex flex-col min-w-[300px] max-w-[380px] flex-1",
                  isDone && "opacity-60 hover:opacity-100 transition-opacity"
                )}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-label-md font-bold text-on-surface tracking-wider uppercase">{label}</h3>
                    <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-code-md">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button className="p-1 hover:bg-surface-container-high rounded text-on-surface-variant">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                  {columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}

const TaskCard = ({ task }: { task: TaskItem }) => {
  const isDone = task.status === "done";

  const dueDate = task.dueDate ? Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div
      className={cn(
        "group bg-surface-container border border-surface-bright p-4 rounded-lg hover:border-primary/50 transition-all duration-200 cursor-pointer shadow-sm",
        task.status === "in-progress" && "border-primary/40 hover:border-primary shadow-md shadow-primary/5",
        isDone && "bg-surface-container-low border-outline-variant hover:border-secondary grayscale hover:grayscale-0"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-label-sm text-primary font-code-md">{task.key}</span>
        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter", priorityColors[task.priority])}>
          {task.priority}
        </span>
      </div>
      <h4 className={cn(
        "text-body-md text-on-surface font-medium leading-tight group-hover:text-primary transition-colors",
        isDone && "line-through group-hover:text-on-surface"
      )}>
        {task.title}
      </h4>
      {task.description && (
        <p className="text-label-sm text-on-surface-variant mt-2 line-clamp-2">{task.description}</p>
      )}
      <div className="mt-4 pt-4 border-t border-outline-variant flex items-center justify-between">
        <div className="flex -space-x-2">
          {task.assignees.map((a) => (
            <div
              key={a.id}
              className="w-6 h-6 rounded-full border-2 border-surface-container bg-surface-container-highest flex items-center justify-center text-[8px] font-bold text-on-surface-variant"
              title={a.user.name}
            >
              {a.user.name.charAt(0)}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 text-on-surface-variant">
          {task.storyPoints && (
            <span className="flex items-center gap-1 text-label-sm">
              {task.storyPoints}pt
            </span>
          )}
          {dueDate !== null && dueDate > 0 && (
            <span className="flex items-center gap-1 text-label-sm">
              {dueDate}d
            </span>
          )}
          {isDone && (
            <CheckCircle size={16} className="text-secondary" />
          )}
        </div>
      </div>
    </div>
  );
};
