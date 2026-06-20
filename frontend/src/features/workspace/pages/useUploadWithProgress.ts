import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { baseApi } from "../../../app/baseApi";

type UseUploadOptions = {
  endpoint?: "file" | "image";
};

export function useUploadWithProgress(options: UseUploadOptions = {}) {
  const { endpoint = "file" } = options;
  const dispatch = useDispatch();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (files: File[], type: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    setProgress(0);
    setIsUploading(true);
    setError(null);

    try {
      const result = await new Promise<unknown>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            let msg = "Upload failed";
            try {
              const body = JSON.parse(xhr.responseText);
              msg = body.message || msg;
            } catch {
              /* ignore parse errors, use fallback message */
            }
            reject(new Error(msg));
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.onabort = () => reject(new Error("Upload cancelled"));

        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
        xhr.open("POST", `${baseUrl}/api/upload/${endpoint}?type=${type}`);
        xhr.send(formData);
      });

      dispatch(baseApi.util.invalidateTags(["Files"]));
      setProgress(100);
      setIsUploading(false);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      setIsUploading(false);
      setProgress(0);
      throw err;
    }
  }, [endpoint, dispatch]);

  return { upload, progress, isUploading, error };
}
