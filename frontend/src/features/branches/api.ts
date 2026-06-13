import { api } from "@/lib/api/axios";
import type { Branch, BranchListParams, BranchPayload, PageResponse } from "./types";

const enableMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === "true";

let branches: Branch[] = [
  { id: 1, code: "CN-GV", name: "Chi nhanh Go Vap", address: "123 Quang Trung, Go Vap, TP.HCM", phone: "02873000001", status: "ACTIVE" },
  { id: 2, code: "CN-TD", name: "Chi nhanh Thu Duc", address: "45 Vo Van Ngan, Thu Duc, TP.HCM", phone: "02873000002", status: "ACTIVE" },
  { id: 3, code: "CN-Q7", name: "Chi nhanh Quan 7", address: "88 Nguyen Thi Thap, Quan 7, TP.HCM", phone: "02873000003", status: "ACTIVE" }
];

export const branchesApi = {
  async list(params: BranchListParams): Promise<PageResponse<Branch>> {
    if (!enableMock) {
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
    }

    await wait();
    const keyword = params.keyword.trim().toLowerCase();
    const filtered = branches
      .filter((branch) => branch.status !== "DELETED")
      .filter((branch) => {
        if (!keyword) return true;
        return [branch.code, branch.name, branch.address, branch.phone].some((value) => value.toLowerCase().includes(keyword));
      });
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / params.pageSize));
    const start = (params.page - 1) * params.pageSize;
    return {
      items: filtered.slice(start, start + params.pageSize),
      page: params.page,
      pageSize: params.pageSize,
      totalItems,
      totalPages
    };
  },

  async create(payload: BranchPayload): Promise<Branch> {
    if (!enableMock) {
      const response = await api.post<Branch>("/api/branches", payload);
      return normalizeBranch(response.data);
    }
    await wait();
    if (branches.some((branch) => branch.code.toLowerCase() === payload.code.toLowerCase())) {
      throw new Error("Ma chi nhanh da ton tai");
    }
    const branch = { ...payload, id: Math.max(0, ...branches.map((item) => item.id)) + 1 };
    branches = [branch, ...branches];
    return branch;
  },

  async update(id: number, payload: BranchPayload): Promise<Branch> {
    if (!enableMock) {
      const response = await api.put<Branch>(`/api/branches/${id}`, payload);
      return normalizeBranch(response.data);
    }
    await wait();
    if (branches.some((branch) => branch.id !== id && branch.code.toLowerCase() === payload.code.toLowerCase())) {
      throw new Error("Ma chi nhanh da ton tai");
    }
    const updated = { ...payload, id };
    branches = branches.map((branch) => (branch.id === id ? updated : branch));
    return updated;
  },

  async softDelete(id: number): Promise<void> {
    if (!enableMock) {
      await api.delete(`/api/branches/${id}`);
      return;
    }
    await wait();
    branches = branches.map((branch) => (branch.id === id ? { ...branch, status: "DELETED" } : branch));
  }
};

function normalizeBranch(branch: Branch): Branch {
  return {
    ...branch,
    phone: branch.phone ?? "",
    status: branch.status ?? "ACTIVE"
  };
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 300));
}
