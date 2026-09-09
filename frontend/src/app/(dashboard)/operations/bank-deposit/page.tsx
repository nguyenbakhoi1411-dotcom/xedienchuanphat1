'use client';

import React, { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OpsPanel, ReportPanel, OpsNavBar, BannerStrip } from '@/modules/bank-deposit/components';
import { BankReceiptForm, BankPaymentForm } from '@/modules/bank-deposit/forms';

type TransactionTab = 'receipts' | 'payments' | 'transactions' | 'reconciliation';

export default function BankDepositPage() {
  const [activeTab, setActiveTab] = useState<TransactionTab>('receipts');
  const [activeNavTab, setActiveNavTab] = useState(1);

  const handleNodeClick = useCallback((nodeId: string, itemValue: string) => {
    if (nodeId === 'receipts') {
      setActiveTab('receipts');
    } else if (nodeId === 'payments') {
      setActiveTab('payments');
    }
  }, []);

  const handleReportClick = useCallback((reportId: string) => {
    // Handle report navigation
    console.log('Clicked report:', reportId);
  }, []);

  const handleTabChange = useCallback((tabId: number) => {
    setActiveNavTab(tabId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tiền gửi (Bank Deposit)</h1>
          <p className="mt-1 text-gray-600">
            Quản lý chứng từ tiền mặt, chứng từ ngân hàng, và đối chiếu
          </p>
        </div>

        {/* Navigation */}
        <OpsNavBar activeTab={activeNavTab} onTabChange={handleTabChange} />

        {/* Promotional Banners */}
        <BannerStrip
          onBannerClick={handleReportClick}
        />

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Operations Panel and Forms (70%) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Operations Panel */}
            <OpsPanel onNodeClick={handleNodeClick} />

            {/* Forms Section */}
            <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as TransactionTab)}>
              <TabsList className="grid w-full grid-cols-2 rounded-t-lg border-b border-gray-200">
                <TabsTrigger value="receipts">Thu tiền</TabsTrigger>
                <TabsTrigger value="payments">Chi tiền</TabsTrigger>
              </TabsList>

              <div className="rounded-b-lg border border-t-0 border-gray-200 bg-white">
                <TabsContent value="receipts" className="mt-0">
                  <BankReceiptForm onSuccess={() => {
                    // Handle success - maybe show a toast
                  }} />
                </TabsContent>

                <TabsContent value="payments" className="mt-0">
                  <BankPaymentForm onSuccess={() => {
                    // Handle success - maybe show a toast
                  }} />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Right Column - Reports Panel (30%) */}
          <div className="lg:col-span-1">
            <ReportPanel onReportClick={handleReportClick} />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          <p>
            💡 Tip: Sử dụng phím tắt <code className="bg-white px-2 py-1">Ctrl+S</code> để lưu,
            <code className="bg-white px-2 py-1">Ctrl+Enter</code> để lưu và tạo mới, 
            <code className="bg-white px-2 py-1">Esc</code> để hủy.
          </p>
        </div>
      </div>
    </div>
  );
}
