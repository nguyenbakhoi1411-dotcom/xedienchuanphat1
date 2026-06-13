import { api } from "@/lib/api/axios";
import type { AssistantResponse, AssistantStatus } from "./types";

export const assistantApi = {
  async status(): Promise<AssistantStatus> {
    const response = await api.get<AssistantStatus>("/api/ai-assistant/status");
    return response.data;
  },

  async ask(params: { question: string; branchId?: number | null }): Promise<AssistantResponse> {
    const response = await api.post<AssistantResponse>("/api/ai-assistant/ask", params);
    return response.data;
  }
};
