import { useState, useRef, useCallback } from "react";
import {
  useGetFilesQuery,
  useDeleteFileMutation,
} from "../workspaceApi";
import { useUploadWithProgress } from "./useUploadWithProgress";
import {
  File,
  FileImage,
  FileText,
  Upload,
  Trash2,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Modal } from "../../../shared/components/Modal";
import { cn } from "../../../shared/lib/utils";
import { toast } from "sonner";

const PAGE_SIZE = 24;

type ViewMode = "list" | "grid";

const FILE_TYPE_MAP: Record<string, typeof FileImage> = {
  image: FileImage,
  application: FileText,
  text: FileText,
  video: FileImage,
  audio: File,
};

function getFileIcon(mimeType: string) {
  const category = mimeType.split("/")[0];
  return FILE_TYPE_MAP[category] ?? File;
}

function getFileTypeLabel(mimeType: string): string {
  const [category, subtype] = mimeType.split("/");
  if (category === "image") return "Image";
  if (category === "application") {
    if (subtype === "pdf") return "PDF";
    if (["zip", "x-zip-compressed", "gzip", "x-tar", "x-rar-compressed", "x-7z-compressed"].includes(subtype)) return "Archive";
    return "Document";
  }
  if (category === "text") return "Text";
  if (category === "video") return "Video";
  if (category === "audio") return "Audio";
  return "Other";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function FilesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [page, setPage] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { upload, progress, isUploading } = useUploadWithProgress();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useGetFilesQuery({
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });
  const [deleteFile] = useDeleteFileMutation();

  const files = data?.files ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete this file?")) {
      deleteFile(id).unwrap().catch(() => toast.error("Failed to delete file"));
    }
  };

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    setSelectedFiles(Array.from(fileList));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    try {
      await upload(selectedFiles, "post");
      setUploadOpen(false);
      setSelectedFiles([]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to upload files. Check file types and sizes.";
      toast.error(msg);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dropZoneRef.current?.classList.add("!border-primary");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dropZoneRef.current?.classList.remove("!border-primary");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dropZoneRef.current?.classList.remove("!border-primary");
    handleFilesSelected(e.dataTransfer.files);
  }, []);

  const renderList = () => (
    <div className="border border-outline-variant rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-surface-container-high text-on-surface-variant text-label-sm text-label-md uppercase tracking-wider">
            <th className="text-left px-4 py-3 font-medium">Name</th>
            <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Type</th>
            <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">Size</th>
            <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Date</th>
            <th className="w-12 px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const Icon = getFileIcon(file.mimeType);
            return (
              <tr key={file.id} className="border-t border-outline-variant hover:bg-surface-variant/50 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="text-primary shrink-0" />
                    <span className="font-body-md text-body-md text-on-surface truncate max-w-[180px] sm:max-w-[280px]">
                      {file.originalName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-on-surface-variant font-body-md text-body-md hidden sm:table-cell">
                  {getFileTypeLabel(file.mimeType)}
                </td>
                <td className="px-4 py-3 text-on-surface-variant font-code-md text-code-md text-right hidden sm:table-cell">
                  {formatSize(file.size)}
                </td>
                <td className="px-4 py-3 text-on-surface-variant font-body-md text-body-md text-right hidden md:table-cell">
                  {formatDate(file.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={(e) => handleDelete(file.id, e)}
                    className="p-1.5 text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {files.map((file) => {
        const Icon = getFileIcon(file.mimeType);
        return (
          <div
            key={file.id}
            className="group relative border border-outline-variant rounded-xl p-5 hover:bg-surface-variant/50 transition-colors"
          >
            <button
              onClick={(e) => handleDelete(file.id, e)}
              className="absolute top-2 right-2 p-1.5 bg-surface-container-high rounded-lg text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-all"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
            <div className="flex flex-col items-center text-center gap-2">
              <Icon size={36} className="text-primary" />
              <span className="font-body-md text-body-md text-on-surface leading-tight line-clamp-2 break-all">
                {file.originalName}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {formatSize(file.size)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Files</h2>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex border border-outline-variant rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={cn("p-2 transition-colors", viewMode === "list" ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:bg-surface-variant")}
              title="List view"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn("p-2 transition-colors", viewMode === "grid" ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:bg-surface-variant")}
              title="Grid view"
            >
              <Grid3X3 size={16} />
            </button>
          </div>
          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:opacity-90 transition-opacity"
          >
            <Upload size={16} />
            Upload
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-on-surface-variant font-body-md">Loading...</div>
      ) : isError ? (
        <div className="bg-error-container/10 border border-error/30 rounded-lg p-6 text-center">
          <p className="font-body-md text-body-md text-error">Failed to load files</p>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <File size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-body-md text-body-md">No files found</p>
          <button
            onClick={() => setUploadOpen(true)}
            className="mt-4 px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            <Upload size={16} />
            Upload your first file
          </button>
        </div>
      ) : (
        <>
          {viewMode === "list" ? renderList() : renderGrid()}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 border border-outline-variant hover:bg-surface-variant transition-colors disabled:opacity-30 rounded-lg"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-code-md text-code-md text-on-surface-variant">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 border border-outline-variant hover:bg-surface-variant transition-colors disabled:opacity-30 rounded-lg"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      <Modal open={uploadOpen} onClose={() => { setUploadOpen(false); setSelectedFiles([]); }} title="Upload Files">
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center hover:!border-primary transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={36} className="mx-auto mb-3 text-on-surface-variant opacity-50" />
          <p className="font-body-md text-body-md text-on-surface-variant">
            Drag & drop files here or click to browse
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="font-label-md text-label-md text-on-surface-variant">
              {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
            </p>
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-3 bg-surface-container-high rounded-lg px-3 py-2">
                <span className="font-body-md text-body-md text-on-surface flex-1 truncate">{file.name}</span>
                <span className="font-code-md text-code-md text-on-surface-variant shrink-0">{formatSize(file.size)}</span>
                <button
                  onClick={() => removeSelectedFile(index)}
                  className="p-1 text-on-surface-variant hover:text-error transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {isUploading ? (
              <div className="w-full mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-label-md text-label-md text-on-surface-variant">Uploading...</span>
                  <span className="font-code-md text-code-md text-primary">{progress}%</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={handleUpload}
                className="w-full mt-4 px-4 py-2.5 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {`Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""}`}
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
