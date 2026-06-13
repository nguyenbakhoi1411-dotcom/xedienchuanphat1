'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBankPayment, useBankAccounts } from '../hooks';
import { CreateBankPaymentRequest, paymentSubTypes } from '../types';

// Validation schema
const bankPaymentSchema = z.object({
  bankAccountId: z.string().uuid('Invalid bank account'),
  subType: z.string().min(1, 'Payment type is required'),
  docDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  amount: z
    .number()
    .positive('Amount must be greater than 0'),
  currency: z.string().length(3, 'Currency code must be 3 characters').optional(),
  exchangeRate: z.number().positive().optional(),
  description: z.string().optional(),
  partnerType: z.enum(['CUSTOMER', 'SUPPLIER', 'EMPLOYEE']).optional(),
  partnerId: z.string().uuid().optional(),
  debitAccount: z.string().min(2, 'Debit account is required'),
  creditAccount: z.string().min(2, 'Credit account is required'),
});

type BankPaymentFormData = z.infer<typeof bankPaymentSchema>;

interface BankPaymentFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function BankPaymentForm({ onSuccess, onError }: BankPaymentFormProps) {
  const { data: bankAccounts = [], isLoading: accountsLoading } = useBankAccounts();
  const { mutate: createPayment, isPending } = useCreateBankPayment();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BankPaymentFormData>({
    resolver: zodResolver(bankPaymentSchema),
    defaultValues: {
      currency: 'VND',
      exchangeRate: 1,
      docDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: BankPaymentFormData) => {
    setSubmitError(null);
    try {
      const payload: CreateBankPaymentRequest = {
        ...data,
        amount: typeof data.amount === 'string' ? parseFloat(data.amount as any) : data.amount,
        exchangeRate: data.exchangeRate || 1,
        currency: data.currency || 'VND',
      };

      createPayment(payload, {
        onSuccess: () => {
          reset();
          onSuccess?.();
        },
        onError: (error: any) => {
          const message = error.response?.data?.message || 'Failed to create payment';
          setSubmitError(message);
          onError?.(message);
        },
      });
    } catch (error: any) {
      const message = error.message || 'An error occurred';
      setSubmitError(message);
      onError?.(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Chi tiền (Payment)</h2>

      {submitError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {submitError}
        </div>
      )}

      {/* Bank Account */}
      <Controller
        name="bankAccountId"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bank Account *
            </label>
            <select
              {...field}
              disabled={accountsLoading || isPending}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 disabled:bg-gray-100"
            >
              <option value="">Select an account</option>
              {bankAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountName} ({acc.accountNo}) - Balance: {acc.currentBalance.toLocaleString()}
                </option>
              ))}
            </select>
            {errors.bankAccountId && (
              <p className="mt-1 text-sm text-red-500">{errors.bankAccountId.message}</p>
            )}
          </div>
        )}
      />

      {/* Payment Type */}
      <Controller
        name="subType"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Type *
            </label>
            <select
              {...field}
              disabled={isPending}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="">Select type</option>
              {paymentSubTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.subType && (
              <p className="mt-1 text-sm text-red-500">{errors.subType.message}</p>
            )}
          </div>
        )}
      />

      {/* Date */}
      <Controller
        name="docDate"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date *
            </label>
            <input
              {...field}
              type="date"
              disabled={isPending}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
            {errors.docDate && (
              <p className="mt-1 text-sm text-red-500">{errors.docDate.message}</p>
            )}
          </div>
        )}
      />

      {/* Amount */}
      <Controller
        name="amount"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount *
            </label>
            <input
              {...field}
              type="number"
              step="0.01"
              disabled={isPending}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>
        )}
      />

      {/* Debit Account */}
      <Controller
        name="debitAccount"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Debit Account *
            </label>
            <input
              {...field}
              type="text"
              placeholder="e.g., 6110"
              disabled={isPending}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
            {errors.debitAccount && (
              <p className="mt-1 text-sm text-red-500">{errors.debitAccount.message}</p>
            )}
          </div>
        )}
      />

      {/* Credit Account */}
      <Controller
        name="creditAccount"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Credit Account *
            </label>
            <input
              {...field}
              type="text"
              placeholder="e.g., 1101"
              disabled={isPending}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
            {errors.creditAccount && (
              <p className="mt-1 text-sm text-red-500">{errors.creditAccount.message}</p>
            )}
          </div>
        )}
      />

      {/* Description */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...field}
              rows={3}
              disabled={isPending}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
        )}
      />

      {/* Submit Button */}
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 disabled:bg-gray-400"
        >
          {isPending ? 'Saving...' : 'Create Payment'}
        </button>
        <button
          type="reset"
          onClick={() => reset()}
          disabled={isPending}
          className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
