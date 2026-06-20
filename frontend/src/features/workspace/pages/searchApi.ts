import { baseApi } from "../../../app/baseApi";

export type SearchFilters = {
    fromDate?: string;
    toDate?: string;
    sender?: string;
    mimeType?: string;
    channelId?: string;
};

export type SearchResults = {
    messages: Array<{
        id: string;
        content: string;
        channelId: string;
        channelName: string;
        senderName: string;
        createdAt: string;
    }>;
    channels: Array<{
        id: string;
        name: string;
        description: string | null;
    }>;
    users: Array<{
        id: string;
        name: string;
        image: string | null;
    }>;
    tasks: Array<{
        id: string;
        title: string;
        description: string | null;
        status: string;
        key: string;
        channelId: string | null;
    }>;
    files: Array<{
        id: string;
        originalName: string;
        storedName: string;
        mimeType: string;
        size: number;
        type: string;
        createdAt: string;
    }>;
};

function buildSearchUrl(params: { q: string; type?: string } & SearchFilters): string {
    const parts: string[] = [];
    parts.push(`q=${encodeURIComponent(params.q)}`);
    if (params.type) parts.push(`type=${params.type}`);
    if (params.fromDate) parts.push(`fromDate=${encodeURIComponent(params.fromDate)}`);
    if (params.toDate) parts.push(`toDate=${encodeURIComponent(params.toDate)}`);
    if (params.sender) parts.push(`sender=${encodeURIComponent(params.sender)}`);
    if (params.mimeType) parts.push(`mimeType=${encodeURIComponent(params.mimeType)}`);
    if (params.channelId) parts.push(`channelId=${encodeURIComponent(params.channelId)}`);
    return `/search?${parts.join("&")}`;
}

export const searchApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        globalSearch: build.query<SearchResults, { q: string; type?: string } & SearchFilters>({
            query: (params) => ({
                url: buildSearchUrl(params),
                method: "GET",
            }),
        }),
    }),
});

export const { useGlobalSearchQuery, useLazyGlobalSearchQuery } = searchApi;
