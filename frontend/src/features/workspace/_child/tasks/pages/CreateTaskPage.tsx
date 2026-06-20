import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../../../shared/lib/utils";
import {
  Bold, Italic, Code, Link, Paperclip, X,
  ChevronRight, Lightbulb,
} from "lucide-react";
import { useCreateTaskMutation, useGetChannelsQuery } from "../../../workspaceApi";
import type { RecurrenceRule } from "../tasksApi";

const priorities = [
  { label: "Low", value: "low", color: "text-secondary border-secondary/20 bg-secondary/10" },
  { label: "Medium", value: "medium", color: "text-tertiary border-tertiary/20 bg-tertiary/10" },
  { label: "High", value: "high", color: "text-primary border-primary bg-primary-container/10" },
  { label: "Critical", value: "critical", color: "text-error border-error bg-error/10" },
] as const;

const labelOptions = ["Feature", "Frontend", "Backend", "Bug", "DevOps"];

export default function CreateTaskPage() {
  const navigate = useNavigate();
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const { data: channels = [] } = useGetChannelsQuery();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [channelId, setChannelId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [storyPoints, setStoryPoints] = useState(5);
  const [labels, setLabels] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | "">("");

  const toggleLabel = (label: string) => {
    setLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setError(null);
    try {
      const payload: Parameters<typeof createTask>[0] = {
        title: title.trim(),
        description: description || undefined,
        priority: priority as "low" | "medium" | "high" | "critical",
        storyPoints,
        channelId: channelId || undefined,
        labels: labels.length ? labels : undefined,
        dueDate: dueDate || undefined,
      };
      if (reminderAt) payload.reminderAt = new Date(reminderAt).toISOString();
      if (recurrenceRule) payload.recurrenceRule = recurrenceRule as RecurrenceRule;
      await createTask(payload).unwrap();
      navigate("/tasks");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-surface-container-high rounded border border-outline-variant">
              <Lightbulb size={18} className="text-secondary" />
            </div>
            <div>
              <h2 className="font-headline-md font-bold text-on-background">Create New Task</h2>
              <p className="text-on-surface-variant text-body-md">Drafting nexus-engine-v2 ticket</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-code-md text-primary opacity-60 font-code-md">ID: NEXUS-AUTO</span>
            <div className="text-code-md text-on-surface-variant">2024-Q3 Cycle</div>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Primary Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Title */}
            <section className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-2 uppercase tracking-wider">Task Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Implement WebGL fallback for older GPUs"
                    className="w-full bg-surface-container border border-outline-variant rounded-lg p-4 font-headline-md text-headline-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-on-surface placeholder:text-outline/50"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-label-md text-on-surface-variant uppercase tracking-wider">Description</label>
                    <div className="flex gap-2">
                      {[Bold, Italic, Code, Link].map((Icon, i) => (
                        <button key={i} className="p-1 text-on-surface-variant hover:text-primary transition-colors">
                          <Icon size={18} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="## Technical Requirements&#10;1. Implement fallback...&#10;2. Optimized shaders..."
                    className="w-full bg-surface-container border border-outline-variant rounded-lg p-4 text-code-md focus:ring-2 focus:ring-primary outline-none text-on-surface-variant resize-none placeholder:text-outline/30"
                    rows={8}
                  />
                </div>
              </div>
            </section>

            {/* Attachments */}
            <section className="grid grid-cols-1 gap-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  setAttachedFiles((prev) => [...prev, ...files]);
                  e.target.value = "";
                }}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex items-center justify-between group cursor-pointer hover:bg-surface-variant transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Paperclip size={18} className="text-outline" />
                  <span className="text-body-md">Attach Files</span>
                </div>
                <span className="text-label-sm text-outline group-hover:text-primary">Max 50MB</span>
              </div>
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 bg-surface-container-high border border-outline-variant rounded-lg px-3 py-1.5 text-sm">
                      <Paperclip size={14} className="text-outline shrink-0" />
                      <span className="truncate max-w-40 text-on-surface">{file.name}</span>
                      <button
                        onClick={() => setAttachedFiles((prev) => prev.filter((_, j) => j !== i))}
                        className="p-0.5 hover:text-error transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right — Context & Metadata */}
          <div className="lg:col-span-1 space-y-6">
            {/* Assignment */}
            <section className="bg-surface-container-low border border-outline-variant rounded-xl p-6 space-y-6">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-2 uppercase tracking-wider">Channel Context</label>
                  <div className="relative">
                    <select
                      value={channelId}
                      onChange={(e) => setChannelId(e.target.value)}
                      className="w-full appearance-none bg-surface-container border border-outline-variant rounded-lg py-2.5 px-4 text-body-md text-on-surface cursor-pointer focus:ring-2 focus:ring-primary"
                    >
                      <option value="">No channel</option>
                      {channels.map((ch) => (
                        <option key={ch.id} value={ch.id}>#{ch.name}</option>
                      ))}
                    </select>
                  <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline rotate-90" />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-label-md text-on-surface-variant mb-2 uppercase tracking-wider">Priority</label>
                <div className="grid grid-cols-2 gap-2">
                  {priorities.map(({ label, value, color }) => (
                    <button
                      key={value}
                      onClick={() => setPriority(value)}
                      className={cn(
                        "border p-2 rounded-lg text-label-sm text-center transition-all",
                        priority === value
                          ? color + " border-primary"
                          : "border-outline-variant text-on-surface-variant hover:bg-surface-variant"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Attributes */}
            <section className="bg-surface-container-low border border-outline-variant rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="text-xs font-bold">&#x2B06;&#xFE0E;</span>
                  <span className="text-label-md">Story Points</span>
                </div>
                <input
                  type="number"
                  value={storyPoints}
                  onChange={(e) => setStoryPoints(Number(e.target.value))}
                  className="w-16 bg-surface-container border border-outline-variant rounded-lg text-center text-code-md p-1 focus:ring-1 focus:ring-primary"
                />
              </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="text-xs">&#x1F4C5;</span>
                    <span className="text-label-md">Due Date</span>
                  </div>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-surface-container border border-outline-variant rounded-lg text-center text-code-md p-1 focus:ring-1 focus:ring-primary"
                  />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="text-xs">&#x23F0;</span>
                  <span className="text-label-md">Reminder</span>
                </div>
                <input
                  type="datetime-local"
                  value={reminderAt}
                  onChange={(e) => setReminderAt(e.target.value)}
                  className="bg-surface-container border border-outline-variant rounded-lg text-center text-code-md p-1 focus:ring-1 focus:ring-primary text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="text-xs">&#x1F501;</span>
                  <span className="text-label-md">Repeat</span>
                </div>
                <select
                  value={recurrenceRule}
                  onChange={(e) => setRecurrenceRule(e.target.value as RecurrenceRule | "")}
                  className="bg-surface-container border border-outline-variant rounded-lg text-center text-code-md p-1 focus:ring-1 focus:ring-primary text-xs"
                >
                  <option value="">No repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="pt-2">
                <label className="block text-label-md text-on-surface-variant mb-2">LABELS</label>
                <div className="flex flex-wrap gap-2">
                  {labelOptions.map((label) => (
                    <button
                      key={label}
                      onClick={() => toggleLabel(label)}
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter border transition-colors",
                        labels.includes(label)
                          ? "bg-secondary/10 text-secondary border-secondary/20"
                          : "bg-surface-variant text-outline border-transparent hover:text-on-surface"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                  <button className="bg-surface-variant text-outline px-2 py-0.5 rounded text-[10px] hover:text-on-surface transition-colors">+</button>
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="space-y-3">
              {error && (
                <p className="text-label-sm text-error bg-error-container/10 px-3 py-2 rounded-lg">{error}</p>
              )}
              <div className="relative">
                <button
                  onClick={handleSubmit}
                  disabled={isCreating || !title.trim()}
                  title={!title.trim() ? "Task title is required" : undefined}
                  className="w-full bg-primary-container text-on-primary-container py-3 rounded-lg font-bold text-label-md uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isCreating ? "Creating..." : "Create Task"}
                </button>
                {!title.trim() && (
                  <p className="text-label-sm text-on-surface-variant mt-1">Enter a task title to enable creation</p>
                )}
              </div>
              <button
                onClick={() => navigate("/tasks")}
                className="w-full border border-outline-variant text-on-surface-variant py-3 rounded-lg font-bold text-label-md uppercase tracking-widest hover:bg-surface-variant transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
