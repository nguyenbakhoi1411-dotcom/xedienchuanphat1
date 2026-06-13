import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { assistantApi } from "./api";

export function useAssistantStatus(enabled: boolean) {
  return useQuery({
    queryKey: ["assistant", "status"],
    queryFn: assistantApi.status,
    enabled,
    staleTime: 60_000,
    retry: false
  });
}

export function useAskAssistant() {
  return useMutation({
    mutationFn: assistantApi.ask,
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the hoi AI Assistant")
  });
}
