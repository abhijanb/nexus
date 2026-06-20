import { baseApi } from "../../../app/baseApi";

export type FileRecord = {
  id: string;
  userId: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  type: string;
  createdAt: string;
};

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFiles: build.query<
      { files: FileRecord[]; total: number },
      { type?: string; limit?: number; offset?: number }
    >({
      query: (params) => ({
        url: "/upload",
        method: "GET",
        params,
      }),
      providesTags: ["Files"],
    }),
    getFile: build.query<FileRecord, string>({
      query: (id) => ({
        url: `/upload/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Files", id }],
    }),
    deleteFile: build.mutation<void, string>({
      query: (id) => ({
        url: `/upload/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Files"],
    }),
    uploadFiles: build.mutation<FileRecord[], { formData: FormData; type: string }>({
      query: ({ formData, type }) => ({
        url: `/upload/file?type=${type}`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Files"],
    }),
    uploadImage: build.mutation<FileRecord, { formData: FormData; type: string }>({
      query: ({ formData, type }) => ({
        url: `/upload/image?type=${type}`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Files"],
    }),
  }),
});

export const {
  useGetFilesQuery,
  useGetFileQuery,
  useDeleteFileMutation,
  useUploadFilesMutation,
  useUploadImageMutation,
} = uploadApi;
