import { api } from "@/lib/api/axios";
import type { Branch, BranchListParams, BranchPayload, PageResponse } from "./types";

export const branchesApi = {
  async list(params: BranchListParams): Promise<PageResponse<Branch>> {
    const response = await api.get<PageResponse<Branch>>("/api/branches", {
      params: {
        keyword: params.keyword,
        page: Math.max(params.page - 1, 0),
        pageSize: params.pageSize
      }
    });
    return {
      ...response.data,
      page: response.data.page + 1,
      items: response.data.items.map(normalizeBranch)
    };
  },

  async create(payload: BranchPayload): Promise<Branch> {
    const response = await api.post<Branch>("/api/branches", payload);
    return normalizeBranch(response.data);
  },

  async update(id: number, payload: BranchPayload): Promise<Branch> {
    const response = await api.put<Branch>(`/api/branches/${id}`, payload);
    return normalizeBranch(response.data);
  },

  async softDelete(id: number): Promise<void> {
    await api.delete(`/api/branches/${id}`);
  }
};

function normalizeBranch(branch: Branch): Branch {
  return {
    ...branch,
    phone: branch.phone ?? "",
    status: branch.status ?? "ACTIVE"
  };
}
