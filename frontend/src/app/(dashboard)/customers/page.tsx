"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CustomerDetailDrawer } from "@/features/customers/CustomerDetailDrawer";
import { CustomerFilters } from "@/features/customers/CustomerFilters";
import { CustomerFormModal } from "@/features/customers/CustomerFormModal";
import { CustomerTable } from "@/features/customers/CustomerTable";
import {
  useAddCareNote,
  useAddCareReminder,
  useCreateCustomer,
  useCustomerDetail,
  useCustomers,
  useUpdateCustomer
} from "@/features/customers/hooks";
import type { Customer, CustomerListParams, CustomerPayload } from "@/features/customers/types";

const initialParams: CustomerListParams = {
  keyword: "",
  type: "ALL",
  source: "ALL",
  page: 1,
  pageSize: 8
};

export default function CustomersPage() {
  const [params, setParams] = useState<CustomerListParams>(initialParams);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  const customers = useCustomers(params);
  const detail = useCustomerDetail(detailId);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const addNote = useAddCareNote();
  const addReminder = useAddCareReminder();

  async function handleSubmit(payload: CustomerPayload) {
    try {
      if (editingCustomer) {
        await updateCustomer.mutateAsync({ id: editingCustomer.id, payload });
      } else {
        await createCustomer.mutateAsync(payload);
      }
      setFormOpen(false);
      setEditingCustomer(null);
    } catch {
      // Toast is handled in mutation hook.
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-text">Customer CRM</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quan ly khach hang, lich su mua hang, bao hanh, ghi chu cham soc va lich nhac.
          </p>
        </div>
        <Button onClick={() => { setEditingCustomer(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" />
          Them khach hang
        </Button>
      </section>

      <section className="rounded-lg border border-border bg-white shadow-soft">
        <div className="border-b border-border p-4">
          <CustomerFilters value={params} onChange={setParams} />
        </div>
        <CustomerTable
          data={customers.data}
          params={params}
          loading={customers.isLoading}
          onPageChange={(page) => setParams((current) => ({ ...current, page }))}
          onView={(customer) => setDetailId(customer.id)}
          onEdit={(customer) => {
            setEditingCustomer(customer);
            setFormOpen(true);
          }}
        />
      </section>

      <CustomerFormModal
        open={formOpen}
        customer={editingCustomer}
        loading={createCustomer.isPending || updateCustomer.isPending}
        onSubmit={(payload) => void handleSubmit(payload)}
        onClose={() => {
          setFormOpen(false);
          setEditingCustomer(null);
        }}
      />

      <CustomerDetailDrawer
        open={detailId !== null}
        customer={detail.data}
        loading={detail.isLoading}
        noteLoading={addNote.isPending}
        reminderLoading={addReminder.isPending}
        onClose={() => setDetailId(null)}
        onAddNote={(payload) => {
          if (detailId) void addNote.mutateAsync({ id: detailId, payload }).catch(() => undefined);
        }}
        onAddReminder={(payload) => {
          if (detailId) void addReminder.mutateAsync({ id: detailId, payload }).catch(() => undefined);
        }}
      />
    </div>
  );
}
