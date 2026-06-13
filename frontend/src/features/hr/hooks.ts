"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { hrApi } from "./api";
import type { EmployeePayload } from "./types";

export function useHrEmployees(branchId?: number) {
  return useQuery({ queryKey: ["hr", "employees", branchId], queryFn: () => hrApi.employees(branchId) });
}

export function useHrShifts() {
  return useQuery({ queryKey: ["hr", "shifts"], queryFn: hrApi.shifts });
}

export function useHrAttendances(params: { employeeId?: number; from?: string; to?: string }) {
  return useQuery({ queryKey: ["hr", "attendances", params], queryFn: () => hrApi.attendances(params) });
}

export function useHrLeaves(status?: string) {
  return useQuery({ queryKey: ["hr", "leaves", status], queryFn: () => hrApi.leaves(status) });
}

export function useHrPayrolls(month: number, year: number) {
  return useQuery({ queryKey: ["hr", "payrolls", month, year], queryFn: () => hrApi.payrolls(month, year) });
}

export function useCreateHrEmployee() {
  return useHrMutation<EmployeePayload>(hrApi.createEmployee, "Da tao nhan vien");
}

export function useUpdateHrEmployee() {
  return useHrMutation<{ id: number; payload: EmployeePayload }>((input) => hrApi.updateEmployee(input.id, input.payload), "Da cap nhat nhan vien");
}

export function useSaveAttendance() {
  return useHrMutation<{ employeeId: number; workDate: string; workShiftId?: number; checkIn?: string; checkOut?: string; note?: string }>(hrApi.saveAttendance, "Da luu cham cong");
}

export function useCreateLeave() {
  return useHrMutation<{ employeeId: number; fromDate: string; toDate: string; reason?: string; leaveType?: string }>(hrApi.createLeave, "Da tao don nghi phep");
}

export function useApproveLeave() {
  return useHrMutation<{ id: number; status: "APPROVED" | "REJECTED"; approvedBy?: number; rejectedReason?: string }>(
    (input) => hrApi.approveLeave(input.id, { status: input.status, approvedBy: input.approvedBy, rejectedReason: input.rejectedReason }),
    "Da cap nhat don nghi phep"
  );
}

export function useGeneratePayroll() {
  return useHrMutation<{ employeeId: number; month: number; year: number; advanceTaken?: number; kpiBonus?: number; recordAccounting?: boolean }>(hrApi.generatePayroll, "Da tinh bang luong");
}

export function useCalculateKpi() {
  return useHrMutation<{ employeeId: number; month: number; year: number }>((input) => hrApi.calculateKpi(input.employeeId, input.month, input.year), "Da tinh KPI");
}

function useHrMutation<TPayload>(mutationFn: (payload: TPayload) => Promise<unknown>, successMessage: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["hr"] });
      toast.success(successMessage);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the thuc hien")
  });
}
