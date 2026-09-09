"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { salesApi } from "@/features/sales/api";
import { useCreateQuotation } from "@/features/sales/hooks";
import type { PosCustomer, PosProduct } from "@/features/sales/types";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  Search,
  AlertTriangle,
  Loader2,
  DollarSign
} from "lucide-react";

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

interface FormItem {
  tempId: string;
  productId: number | null;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  listPrice: number; // limit check
  discountPercent: number;
  discountAmount: number;
  vatRate: number;
  totalPrice: number;
  selectedSerial: string;
  serials: string[];
  unitName: string;
  // Searching states
  keyword: string;
  searching: boolean;
  searchResults: PosProduct[];
  showDropdown: boolean;
}

export default function NewQuotationPage() {
  const user = useCurrentUser();
  const router = useRouter();
  const currentBranchId = user?.branchId ? Number(user.branchId) : 1;

  const createQuoteMutation = useCreateQuotation();

  // Common metadata Lists (Mock/Fetched)
  const [warehouses, setWarehouses] = useState<Array<{ id: number; name: string }>>([
    { id: 1, name: "Kho chính Gò Vấp" },
    { id: 2, name: "Kho trung tâm Thủ Đức" },
    { id: 3, name: "Kho Quận 7" }
  ]);
  const [employees, setEmployees] = useState<Array<{ id: number; name: string }>>([
    { id: 101, name: "Nguyễn Văn Kinh Doanh" },
    { id: 102, name: "Trần Thị Tư Vấn" },
    { id: 103, name: "Lê Văn Bán Hàng" }
  ]);

  // Section 1 fields
  const [orderNo] = useState(() => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(100 + Math.random() * 900);
    return `BG-${dateStr}-${random}`;
  });
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [warehouseId, setWarehouseId] = useState(1);
  const [salespersonId, setSalespersonId] = useState(101);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Customer search state
  const [customerKeyword, setCustomerKeyword] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<PosCustomer | null>(null);
  const [customerSearchList, setCustomerSearchList] = useState<PosCustomer[]>([]);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // New customer info state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [contactPerson, setContactPerson] = useState("");

  // Section 2 fields (products list)
  const [items, setItems] = useState<FormItem[]>([
    {
      tempId: "1",
      productId: null,
      productName: "",
      productCode: "",
      quantity: 1,
      unitPrice: 0,
      listPrice: 0,
      discountPercent: 0,
      discountAmount: 0,
      vatRate: 10,
      totalPrice: 0,
      selectedSerial: "",
      serials: [],
      unitName: "Cái",
      keyword: "",
      searching: false,
      searchResults: [],
      showDropdown: false
    }
  ]);

  // Section 3 payment fields
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER" | "MOMO">("BANK_TRANSFER");

  // Save dialogs confirmation
  const [confirmSubmitDraft, setConfirmSubmitDraft] = useState(false);
  const [confirmSubmitConfirm, setConfirmSubmitConfirm] = useState(false);

  // --- Customer autocomplete search debounce ---
  useEffect(() => {
    if (!customerKeyword.trim() || selectedCustomer?.name === customerKeyword) {
      setCustomerSearchList([]);
      return;
    }

    setSearchingCustomer(true);
    const delay = setTimeout(async () => {
      try {
        const results = await salesApi.searchCustomers(customerKeyword);
        setCustomerSearchList(results);
        setShowCustomerDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchingCustomer(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [customerKeyword, selectedCustomer]);

  const selectCustomer = (cust: PosCustomer) => {
    setSelectedCustomer(cust);
    setCustomerKeyword(cust.phone || `KH${cust.id}`);
    setCustomerName(cust.name);
    setCustomerPhone(cust.phone || "");
    setDeliveryAddress(cust.address || "");
    setShowCustomerDropdown(false);
  };

  // --- Product autocomplete search debounce ---
  const handleProductSearch = (index: number, val: string) => {
    setItems(prev => {
      const newItems = [...prev];
      if (!newItems[index]) return prev;
      newItems[index].keyword = val;
      newItems[index].showDropdown = true;
      if (!val.trim()) {
        newItems[index].searchResults = [];
        newItems[index].searching = false;
      } else {
        newItems[index].searching = true;
      }
      return newItems;
    });

    if (!val.trim()) return;

    // clear previous timeout if typing
    const delay = setTimeout(async () => {
      try {
        const results = await salesApi.searchProducts(val, currentBranchId);
        setItems(prev => {
          const currentItems = [...prev];
          if (currentItems[index]) {
            currentItems[index].searchResults = results;
            currentItems[index].searching = false;

            // Auto-select if there is a single exact match for the code (useful for paste)
            if (results.length === 1 && (results[0].productCode.toUpperCase() === val.toUpperCase())) {
              const p = results[0];
              currentItems[index].productId = p.id;
              currentItems[index].productName = p.productName;
              currentItems[index].productCode = p.productCode;
              currentItems[index].keyword = p.productName;
              // Keep pasted price if exists, otherwise use default
              currentItems[index].unitPrice = currentItems[index].unitPrice > 0 ? currentItems[index].unitPrice : p.salePrice;
              currentItems[index].listPrice = p.listPrice || p.salePrice;
              currentItems[index].serials = p.serials.map(s => s.serialNumber);
              currentItems[index].selectedSerial = p.serials[0]?.serialNumber || "";
              currentItems[index].showDropdown = false;
              recalculateItem(currentItems[index]);
            }
          }
          return currentItems;
        });
      } catch (err) {
        console.error(err);
        setItems(prev => {
          const currentItems = [...prev];
          if (currentItems[index]) currentItems[index].searching = false;
          return currentItems;
        });
      }
    }, 300);

    return () => clearTimeout(delay);
  };

  const handlePasteExcel = (e: React.ClipboardEvent<HTMLTableSectionElement>) => {
    const activeEl = document.activeElement as HTMLElement;
    const clipboardData = e.clipboardData.getData("Text");
    
    // Allow normal paste inside inputs if it's just a single line
    if (activeEl && activeEl.tagName === "INPUT" && !clipboardData.includes("\n")) {
      return;
    }

    if (!clipboardData || !clipboardData.includes("\t")) return; // not excel data

    e.preventDefault();
    const rows = clipboardData.split(/\r?\n/).filter(r => r.trim());
    
    setItems(prev => {
      const newItems = [...prev];
      // remove empty default row if we paste fresh
      if (newItems.length === 1 && !newItems[0].productId && !newItems[0].keyword) {
        newItems.shift();
      }

      rows.forEach(row => {
        const cols = row.split("\t").map(c => c.trim());
        if (cols.length < 2) return;

        let offset = 0;
        // If col 0 is a number (STT) and col 1 is string, shift offset
        if (/^\d+$/.test(cols[0]) && cols.length > 2 && isNaN(Number(cols[1].replace(/,/g, '')))) {
          offset = 1;
        }
        
        const keyword = cols[offset] || "";
        let qty = 1;
        let price = 0;
        
        const parseNum = (str: string) => Number(str.replace(/[^0-9.-]+/g, ""));
        
        let foundQty = false;
        let foundPrice = false;
        for (let i = offset + 1; i < cols.length; i++) {
           const val = cols[i];
           if (val && !isNaN(parseNum(val))) {
              if (!foundQty) {
                 qty = parseNum(val) || 1;
                 foundQty = true;
              } else if (!foundPrice) {
                 price = parseNum(val) || 0;
                 foundPrice = true;
              }
           }
        }

        const itemIdx = newItems.length;
        const newItem: FormItem = {
          tempId: String(Date.now() + Math.random()),
          productId: null,
          productName: keyword,
          productCode: keyword,
          quantity: qty,
          unitPrice: price,
          listPrice: price,
          discountPercent: 0,
          discountAmount: 0,
          vatRate: 10,
          totalPrice: qty * price,
          selectedSerial: "",
          serials: [],
          unitName: "Cái",
          keyword: keyword,
          searching: true, // will be resolved by api search
          searchResults: [],
          showDropdown: false
        };
        recalculateItem(newItem);
        newItems.push(newItem);

        // Async trigger product search to resolve productId
        setTimeout(() => {
          handleProductSearch(itemIdx, keyword);
        }, itemIdx * 50); // stagger searches slightly to avoid spam
      });

      return newItems;
    });
    
    toast.success(`Đã dán ${rows.length} dòng từ Excel. Đang tự động tìm khớp mã hàng...`);
  };

  const selectProduct = (index: number, product: PosProduct) => {
    const newItems = [...items];
    newItems[index].productId = product.id;
    newItems[index].productName = product.productName;
    newItems[index].productCode = product.productCode;
    newItems[index].keyword = product.productName;
    newItems[index].unitPrice = product.salePrice;
    newItems[index].listPrice = product.listPrice || product.salePrice;
    newItems[index].serials = product.serials.map(s => s.serialNumber);
    newItems[index].selectedSerial = product.serials[0]?.serialNumber || "";
    newItems[index].showDropdown = false;
    
    // Recalculate item totals
    recalculateItem(newItems[index]);
    setItems(newItems);
  };

  const updateItemQty = (index: number, qty: number) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, qty);
    recalculateItem(newItems[index]);
    setItems(newItems);
  };

  const updateItemPrice = (index: number, price: number) => {
    const newItems = [...items];
    newItems[index].unitPrice = Math.max(0, price);
    recalculateItem(newItems[index]);
    setItems(newItems);
  };

  const updateItemDiscount = (index: number, discPercent: number) => {
    const newItems = [...items];
    newItems[index].discountPercent = Math.min(100, Math.max(0, discPercent));
    recalculateItem(newItems[index]);
    setItems(newItems);
  };

  const recalculateItem = (item: FormItem) => {
    const discAmount = (item.quantity * item.unitPrice * item.discountPercent) / 100;
    item.discountAmount = discAmount;
    item.totalPrice = (item.quantity * item.unitPrice) - discAmount;
  };

  const addItemRow = () => {
    setItems(prev => [
      ...prev,
      {
        tempId: String(Date.now()),
        productId: null,
        productName: "",
        productCode: "",
        quantity: 1,
        unitPrice: 0,
        listPrice: 0,
        discountPercent: 0,
        discountAmount: 0,
        vatRate: 10,
        totalPrice: 0,
        selectedSerial: "",
        serials: [],
        unitName: "Cái",
        keyword: "",
        searching: false,
        searchResults: [],
        showDropdown: false
      }
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // --- Sum Totals ---
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let vatAmount = 0;

    items.forEach(item => {
      subtotal += item.quantity * item.unitPrice;
      totalDiscount += item.discountAmount;
      vatAmount += (item.totalPrice * item.vatRate) / 100;
    });

    const totalAmount = subtotal - totalDiscount + vatAmount;
    const remainingAmount = totalAmount - depositAmount;

    return {
      subtotal,
      totalDiscount,
      vatAmount,
      totalAmount,
      remainingAmount
    };
  }, [items, depositAmount]);

  // Max deposit validation constraint
  useEffect(() => {
    if (depositAmount > totals.totalAmount) {
      setDepositAmount(totals.totalAmount);
    }
  }, [depositAmount, totals.totalAmount]);

  const isValid = useMemo(() => {
    // Has customer
    if (!selectedCustomer && !customerName.trim()) return false;
    // Has at least one product
    const hasProducts = items.every(item => item.productId !== null && item.quantity > 0);
    if (!hasProducts) return false;
    // Deposit validation
    if (depositAmount < 0 || depositAmount > totals.totalAmount) return false;

    return true;
  }, [selectedCustomer, customerName, items, depositAmount, totals.totalAmount]);

  // --- Handle Submit ---
  async function handleSave(status: 'DRAFT' | 'CONFIRMED') {
    if (!selectedCustomer && !customerName.trim()) {
      toast.error("Vui lòng nhập tên khách hàng.");
      return;
    }
    const validItems = items.filter(it => it.productId);
    if (validItems.length === 0) {
      toast.error("Báo giá phải có ít nhất 1 sản phẩm hợp lệ.");
      return;
    }

    try {
      let finalCustomerId = selectedCustomer?.id;
      if (!finalCustomerId) {
        // Tự động tạo khách hàng mới
        const { customersApi } = await import("@/features/customers/api");
        const newCustomer = await customersApi.create({
          fullName: customerName,
          phone: customerPhone || "0000000000",
          address: deliveryAddress,
          type: "NEW",
          source: "WALK_IN"
        } as any);
        finalCustomerId = newCustomer.id;
      }

      await createQuoteMutation.mutateAsync({
        branchId: currentBranchId,
        customerId: finalCustomerId,
        employeeId: salespersonId,
        orderDate,
        discountAmount: totals.totalDiscount,
        paidAmount: 0,
        paymentMethod: "CASH",
        voucherCode: "",
        confirm: status === 'CONFIRMED',
        issueInvoice: false,
        payment: { cashAmount: 0, bankAmount: 0, installmentAmount: 0, discountAmount: totals.totalDiscount, method: "CASH" },
        items: validItems.map(it => ({
          productId: it.productId!,
          selectedSerials: it.selectedSerial ? [it.selectedSerial] : [],
          quantity: it.quantity,
          unitPrice: it.unitPrice
        }))
      } as any);

      toast.success("Tạo báo giá thành công!");
      router.push("/sales");
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu báo giá.");
    }
  }

  return (
    <div className="flex flex-col space-y-6 w-full pb-10">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Tạo báo giá mới</h1>
          <p className="mt-1 text-sm text-slate-500">
            Điền thông tin và lưu báo giá.
          </p>
        </div>
      </div>

      {/* Main 2-Column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Form entries (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          {/* SECTION 1: THÔNG TIN CHUNG (MISA Style) */}
          <div className="bg-[#eef5f9] rounded-sm p-4 text-[13px] text-gray-800 border-b-4 border-gray-200">
            <div className="grid grid-cols-12 gap-x-6 gap-y-3">
              
              {/* Cột 1 & 2: Thông tin khách hàng (chiếm 8 cột) */}
              <div className="col-span-12 md:col-span-9 grid grid-cols-12 gap-x-4 gap-y-3">
                {/* Row 1 */}
                <div className="col-span-4">
                  <label className="block mb-1 font-medium">Mã khách hàng</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={customerKeyword}
                      onChange={(e) => {
                        setCustomerKeyword(e.target.value);
                        if (selectedCustomer) setSelectedCustomer(null);
                      }}
                      placeholder="Tìm mã hoặc tên..."
                      className="w-full h-7 px-2 border border-gray-300 focus:outline-none focus:border-blue-400"
                    />
                    <div className="absolute right-0 flex h-7">
                      <button type="button" className="px-1.5 border-l border-gray-300 bg-gray-50 hover:bg-gray-100 text-green-600">
                        <Plus className="h-4 w-4" />
                      </button>
                      <button type="button" className="px-1.5 border-l border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500">
                        <Search className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Suggestions Dropdown */}
                    {showCustomerDropdown && customerSearchList.length > 0 && (
                      <div className="absolute top-full left-0 w-[400px] mt-0.5 bg-white border border-gray-300 shadow-md max-h-48 overflow-y-auto z-50">
                        <table className="w-full text-left">
                          <thead className="bg-gray-100 sticky top-0">
                            <tr>
                              <th className="px-2 py-1 font-medium text-gray-600">Mã khách hàng</th>
                              <th className="px-2 py-1 font-medium text-gray-600">Tên khách hàng</th>
                              <th className="px-2 py-1 font-medium text-gray-600">Điện thoại</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerSearchList.map(cust => (
                              <tr
                                key={cust.id}
                                onClick={() => selectCustomer(cust)}
                                className="hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                              >
                                <td className="px-2 py-1.5">{cust.phone || `KH${cust.id}`}</td>
                                <td className="px-2 py-1.5">{cust.name}</td>
                                <td className="px-2 py-1.5">{cust.phone}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-8">
                  <label className="block mb-1 font-medium">Tên khách hàng</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setSelectedCustomer(null);
                    }}
                    placeholder="Nhập tên khách hàng mới..."
                    className="w-full h-7 px-2 border border-gray-300 focus:outline-none focus:border-blue-400"
                  />
                </div>

                {/* Row 2 */}
                <div className="col-span-4">
                  <label className="block mb-1 font-medium">Mã số thuế / SĐT</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="SĐT hoặc MST"
                    className="w-full h-7 px-2 border border-gray-300 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div className="col-span-8">
                  <label className="block mb-1 font-medium">Địa chỉ</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full h-7 px-2 border border-gray-300 focus:outline-none focus:border-blue-400"
                  />
                </div>

                {/* Row 3 */}
                <div className="col-span-4">
                  <label className="block mb-1 font-medium">Người liên hệ</label>
                  <input
                    type="text"
                    className="w-full h-7 px-2 border border-gray-300 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div className="col-span-8">
                  <label className="block mb-1 font-medium">Ghi chú</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-7 px-2 border border-gray-300 focus:outline-none focus:border-blue-400"
                  />
                </div>

                {/* Row 4 */}
                <div className="col-span-4">
                  <label className="block mb-1 font-medium">Nhân viên bán hàng</label>
                  <div className="relative flex items-center">
                    <select
                      value={salespersonId}
                      onChange={(e) => setSalespersonId(Number(e.target.value))}
                      className="w-full h-7 px-2 border border-gray-300 focus:outline-none focus:border-blue-400 appearance-none bg-white"
                    >
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-0 flex h-7 pointer-events-none">
                      <div className="px-1.5 border-l border-gray-300 bg-gray-50 flex items-center">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-8 flex items-end pb-1">
                  <span className="text-blue-600 hover:underline cursor-pointer">Tham chiếu ...</span>
                </div>
              </div>

              {/* Cột 3: Thông tin chứng từ (chiếm 4 cột) */}
              <div className="col-span-12 md:col-span-3 flex flex-col gap-y-3 border-l border-gray-200 pl-6">
                <div>
                  <label className="block mb-1 font-medium">Số báo giá</label>
                  <input
                    type="text"
                    readOnly
                    value={orderNo}
                    className="w-full h-7 px-2 border border-gray-300 bg-white focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Ngày báo giá</label>
                  <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full h-7 px-2 border border-gray-300 bg-white focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Hiệu lực đến</label>
                  <input
                    type="date"
                    className="w-full h-7 px-2 border border-gray-300 bg-white focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: DANH MỤC SẢN PHẨM */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-gray-800 text-sm">Danh mục sản phẩm</h3>
                <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                  💡 Có thể Copy/Paste trực tiếp từ file Excel vào bảng
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                onClick={addItemRow}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Thêm sản phẩm
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                    <th className="py-2.5 px-2 text-center w-10">STT</th>
                    <th className="py-2.5 px-2 w-56">Sản phẩm</th>
                    <th className="py-2.5 px-2 w-32">Số Serial</th>
                    <th className="py-2.5 px-2 w-16">ĐVT</th>
                    <th className="py-2.5 px-2 w-16 text-center">SL</th>
                    <th className="py-2.5 px-2 w-28 text-right">Đơn giá (đ)</th>
                    <th className="py-2.5 px-2 w-16 text-center">% CK</th>
                    <th className="py-2.5 px-2 w-16 text-center">% VAT</th>
                    <th className="py-2.5 px-2 text-right w-28">Thành tiền</th>
                    <th className="py-2.5 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700" onPaste={handlePasteExcel}>
                  {items.map((item, index) => {
                    const priceWarning = item.productId && item.unitPrice < item.listPrice;
                    return (
                      <tr key={item.tempId} className="hover:bg-gray-50/20 align-middle">
                        {/* STT */}
                        <td className="py-2 px-2 text-center text-gray-400 font-semibold">{index + 1}</td>
                        
                        {/* Product Search */}
                        <td className="py-2 px-2 relative">
                          <div className="relative">
                            <input
                              type="text"
                              value={item.keyword}
                              onChange={(e) => handleProductSearch(index, e.target.value)}
                              placeholder="Tìm kiếm SP..."
                              className="w-full h-8 px-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {item.searching && (
                              <Loader2 className="absolute right-2 top-2 h-3.5 w-3.5 text-gray-400 animate-spin" />
                            )}
                          </div>

                          {/* Product Dropdown */}
                          {item.showDropdown && item.searchResults.length > 0 && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto z-40 divide-y divide-gray-100">
                              {item.searchResults.map(p => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => selectProduct(index, p)}
                                  className="w-full text-left p-2 hover:bg-indigo-50/50 transition-colors flex justify-between"
                                >
                                  <span className="font-semibold">{p.productName}</span>
                                  <span className="text-gray-400 font-mono">{p.productCode}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Serial */}
                        <td className="py-2 px-2">
                          {item.serials.length > 0 ? (
                            <select
                              value={item.selectedSerial}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[index].selectedSerial = e.target.value;
                                setItems(newItems);
                              }}
                              className="w-full h-8 px-2 rounded-md border border-gray-200 bg-white font-mono"
                            >
                              {item.serials.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-gray-400 italic px-2">Không có</span>
                          )}
                        </td>

                        {/* ĐVT */}
                        <td className="py-2 px-2 text-gray-500 font-medium text-center">{item.unitName}</td>

                        {/* SL */}
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQty(index, Number(e.target.value))}
                            className="w-full h-8 text-center rounded-md border border-gray-200 focus:outline-none"
                          />
                        </td>

                        {/* Đơn giá */}
                        <td className="py-2 px-2 relative">
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updateItemPrice(index, Number(e.target.value))}
                              className={`w-full h-8 text-right pr-6 rounded-md border focus:outline-none focus:ring-1 ${
                                priceWarning ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200 focus:ring-indigo-500'
                              }`}
                            />
                            {priceWarning && (
                              <span
                                className="absolute right-2 top-2 h-4 w-4 flex items-center justify-center"
                                title="Đơn giá thấp hơn chính sách niêm yết!"
                              >
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                              </span>
                            )}
                          </div>
                        </td>

                        {/* % CK */}
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discountPercent}
                            onChange={(e) => updateItemDiscount(index, Number(e.target.value))}
                            className="w-full h-8 text-center rounded-md border border-gray-200"
                          />
                        </td>

                        {/* % VAT */}
                        <td className="py-2 px-2 text-center text-gray-500 font-bold">{item.vatRate}%</td>

                        {/* Thành tiền */}
                        <td className="py-2 px-2 text-right font-extrabold text-gray-900">{fmt(item.totalPrice)}</td>

                        {/* Remove button */}
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            disabled={items.length === 1}
                            className={`p-1.5 rounded-md ${
                              items.length === 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Summary Panel (1/3 width) */}
        <div className="flex flex-col space-y-6 sticky top-6">
          {/* SECTION 3: THANH TOÁN */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col space-y-4 text-xs">
            <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2">Chi tiết thanh toán</h3>
            
            <div className="flex flex-col space-y-2.5">
              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-700">Mã báo giá</label>
                <input type="text" className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 font-mono text-gray-500" value={orderNo} readOnly />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-700">Ngày báo giá</label>
                <input type="date" className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white" value={orderDate} readOnly />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Tổng tiền hàng:</span>
                <span className="text-gray-800 font-bold">{fmt(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Tổng chiết khấu:</span>
                <span className="text-rose-500 font-bold">-{fmt(totals.totalDiscount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Thuế GTGT (10%):</span>
                <span className="text-gray-800 font-bold">+{fmt(totals.vatAmount)}</span>
              </div>
              
              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-baseline">
                <span className="text-gray-900 font-extrabold text-sm">TỔNG THANH TOÁN:</span>
                <span className="text-xl font-black text-indigo-700">{fmt(totals.totalAmount)}</span>
              </div>
            </div>

            {/* Deposit Section */}
            <div className="border-t border-gray-100 pt-4 flex flex-col space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Số tiền đặt cọc (đ)</label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    max={totals.totalAmount}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full h-9 pl-8 pr-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                  />
                </div>
              </div>

              {depositAmount > 0 && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phương thức đặt cọc</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="BANK_TRANSFER">Chuyển khoản</option>
                    <option value="CASH">Tiền mặt</option>
                    <option value="MOMO">Ví MoMo</option>
                  </select>
                </div>
              )}

              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="font-semibold text-gray-500">Còn lại cần thu:</span>
                <span className="text-base font-bold text-gray-800">{fmt(totals.remainingAmount)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
              <Button
                type="button"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                disabled={!isValid || createQuoteMutation.isPending}
                onClick={() => setConfirmSubmitConfirm(true)}
              >
                <CheckCircle className="mr-1.5 h-4 w-4" /> Xác nhận đơn
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-200 hover:bg-gray-50 font-semibold"
                disabled={!isValid || createQuoteMutation.isPending}
                onClick={() => setConfirmSubmitDraft(true)}
              >
                <Save className="mr-1.5 h-4 w-4" /> Lưu nháp
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== CONFIRM ORDER DIALOG ==================== */}
      {confirmSubmitConfirm && (
        <ConfirmDialog
          isOpen={confirmSubmitConfirm}
          onClose={() => setConfirmSubmitConfirm(false)}
          title="Xác nhận báo giá"
          description="Bạn có chắc chắn muốn lập và xác nhận báo giá này?"
          onConfirm={() => {
            setConfirmSubmitConfirm(false);
            handleSave('CONFIRMED');
          }}
        />
      )}

      {/* ==================== CONFIRM DRAFT DIALOG ==================== */}
      {confirmSubmitDraft && (
        <ConfirmDialog
          isOpen={confirmSubmitDraft}
          onClose={() => setConfirmSubmitDraft(false)}
          title="Lưu nháp báo giá"
          description="Lưu báo giá này dưới dạng Nháp (DRAFT). Bạn có thể tiếp tục cập nhật thông tin sau."
          onConfirm={() => {
            setConfirmSubmitDraft(false);
            handleSave('DRAFT');
          }}
        />
      )}
    </div>
  );
}
