export type BranchStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export type Branch = {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  status: BranchStatus;
};

export type BranchPayload = Omit<Branch, "id">;

export type BranchListParams = {
  keyword: string;
  page: number;
  pageSize: number;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
