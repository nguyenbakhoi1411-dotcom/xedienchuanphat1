import { api } from "@/lib/api/axios";
import type {
  Branch,
  ExportStockPayload,
  ImportStockPayload,
  InventoryHistoryParams,
  InventoryListParams,
  InventoryStock,
  InventoryTransaction,
  InventoryTransactionType,
  PageResponse,
  StockCountPayload,
  TransferStockPayload
} from "./types";

const enableMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === "true";

export const branches: Branch[] = [
  { id: 1, name: "Go Vap" },
  { id: 2, name: "Thu Duc" },
  { id: 3, name: "Quan 7" }
];

const productNames = {
  1: { productCode: "CP-S1", productName: "Xe may dien CP S1", category: "Xe may dien" },
  2: { productCode: "CP-CITY", productName: "Xe may dien CP City", category: "Xe may dien" },
  3: { productCode: "PIN-LFP-72", productName: "Binh ac quy LFP 72V", category: "Pin / Ac quy" },
  4: { productCode: "SAC-NHANH", productName: "Bo sac nhanh", category: "Bo sac" }
};

let stocks: InventoryStock[] = [
  stock(1, 1, 1, 28, 8, 11800000),
  stock(2, 2, 1, 9, 8, 11800000),
  stock(3, 1, 2, 14, 6, 9800000),
  stock(4, 3, 2, 4, 6, 9800000),
  stock(5, 1, 3, 5, 10, 4200000),
  stock(6, 2, 3, 2, 10, 4200000),
  stock(7, 1, 4, 35, 12, 950000)
];

let transactions: InventoryTransaction[] = [
  tx(1, "IMPORT", "NK-2026-001", "2026-06-01", 1, undefined, 1, 12, "Nhap xe moi"),
  tx(2, "TRANSFER_OUT", "CK-2026-001", "2026-06-03", 1, 1, 2, 4, "Chuyen xe sang Thu Duc"),
  tx(3, "EXPORT", "XK-2026-001", "2026-06-04", 3, 1, undefined, 3, "Xuat ban hang"),
  tx(4, "STOCKTAKE", "KK-2026-001", "2026-06-05", 4, undefined, 3, 4, "Kiem kho dinh ky")
];

export const inventoryApi = {
  async listStock(params: InventoryListParams): Promise<PageResponse<InventoryStock>> {
    if (!enableMock) {
      const response = await api.get<PageResponse<InventoryStock & { minQuantity?: number }>>("/api/inventory/stocks", {
        params: {
          branchId: params.branchId === "ALL" ? undefined : params.branchId,
          warehouseId: params.warehouseId === "ALL" ? undefined : params.warehouseId,
          page: Math.max(params.page - 1, 0),
          pageSize: params.pageSize
        }
      });
      return {
        ...response.data,
        page: response.data.page + 1,
        items: response.data.items.map((item) => ({
          ...item,
          branchName: branches.find((branch) => branch.id === item.branchId)?.name ?? String(item.branchId),
          warehouseName: item.warehouseName ?? "",
          productCode: item.productCode ?? String(item.productId),
          category: item.category ?? "",
          minimumStock: item.minimumStock ?? item.minQuantity ?? 0,
          reservedQuantity: item.reservedQuantity ?? 0,
          availableQuantity: item.availableQuantity ?? item.quantityOnHand,
          maxQuantity: item.maxQuantity ?? 0,
          averageCost: item.averageCost ?? 0,
          updatedAt: item.updatedAt ?? ""
        }))
      };
    }
    await wait();
    const keyword = params.keyword.trim().toLowerCase();
    const filtered = stocks
      .filter((item) => {
        const matchKeyword =
          keyword.length === 0 ||
          item.productName.toLowerCase().includes(keyword) ||
          item.productCode.toLowerCase().includes(keyword);
        const matchBranch = params.branchId === "ALL" || item.branchId === params.branchId;
        const matchLowStock = !params.lowStockOnly || item.quantityOnHand <= item.minimumStock;
        return matchKeyword && matchBranch && matchLowStock;
      })
      .sort((a, b) => Number(b.quantityOnHand <= b.minimumStock) - Number(a.quantityOnHand <= a.minimumStock));
    return paginate(filtered, params.page, params.pageSize);
  },

  async listHistory(params: InventoryHistoryParams): Promise<PageResponse<InventoryTransaction>> {
    if (!enableMock) {
      const response = await api.get<PageResponse<InventoryTransaction & { fromBranchId?: number; toBranchId?: number }>>("/api/inventory/transactions", {
        params: {
          branchId: params.branchId === "ALL" ? undefined : params.branchId,
          type: params.type === "ALL" ? undefined : params.type,
          page: Math.max(params.page - 1, 0),
          pageSize: params.pageSize
        }
      });
      const keyword = params.keyword.trim().toLowerCase();
      const items = response.data.items
        .map(normalizeTransaction)
        .filter((item) => {
          if (!keyword) return true;
          return item.productName.toLowerCase().includes(keyword) || item.productCode.toLowerCase().includes(keyword) || item.transactionNo.toLowerCase().includes(keyword);
        });
      return {
        ...response.data,
        page: response.data.page + 1,
        items
      };
    }
    await wait();
    const keyword = params.keyword.trim().toLowerCase();
    const filtered = transactions.filter((item) => {
      const matchKeyword =
        keyword.length === 0 ||
        item.productName.toLowerCase().includes(keyword) ||
        item.productCode.toLowerCase().includes(keyword) ||
        item.transactionNo.toLowerCase().includes(keyword);
      const matchType = params.type === "ALL" || item.type === params.type;
      const matchBranch =
        params.branchId === "ALL" ||
        item.fromBranchName === branchName(params.branchId) ||
        item.toBranchName === branchName(params.branchId);
      return matchKeyword && matchType && matchBranch;
    });
    return paginate(filtered, params.page, params.pageSize);
  },

  async importStock(payload: ImportStockPayload): Promise<void> {
    if (!enableMock) {
      await api.post("/api/inventory/import", {
        branchId: payload.branchId,
        warehouseId: payload.warehouseId,
        productId: payload.productId,
        quantity: payload.quantity,
        unitCost: payload.unitCost,
        transactionDate: payload.transactionDate,
        note: payload.note
      });
      return;
    }
    await wait();
    const item = ensureStock(payload.branchId, payload.productId, payload.unitCost);
    item.quantityOnHand += payload.quantity;
    item.availableQuantity = item.quantityOnHand - item.reservedQuantity;
    item.averageCost = payload.unitCost;
    item.updatedAt = payload.transactionDate;
    addTransaction("IMPORT", payload.transactionNo, payload.transactionDate, payload.productId, undefined, payload.branchId, payload.quantity, payload.note);
  },

  async exportStock(payload: ExportStockPayload): Promise<void> {
    if (!enableMock) {
      await api.post("/api/inventory/export", {
        branchId: payload.branchId,
        warehouseId: payload.warehouseId,
        productId: payload.productId,
        quantity: payload.quantity,
        transactionDate: payload.transactionDate,
        note: payload.note
      });
      return;
    }
    await wait();
    const item = findStock(payload.branchId, payload.productId);
    if (!item || item.availableQuantity < payload.quantity) {
      throw new Error("Ton kho khong du de xuat");
    }
    item.quantityOnHand -= payload.quantity;
    item.availableQuantity = item.quantityOnHand - item.reservedQuantity;
    item.updatedAt = payload.transactionDate;
    addTransaction("EXPORT", payload.transactionNo, payload.transactionDate, payload.productId, payload.branchId, undefined, payload.quantity, payload.note);
  },

  async transferStock(payload: TransferStockPayload): Promise<void> {
    if (!enableMock) {
      await api.post("/api/inventory/transfer", {
        fromBranchId: payload.fromBranchId,
        fromWarehouseId: payload.fromWarehouseId,
        toBranchId: payload.toBranchId,
        toWarehouseId: payload.toWarehouseId,
        productId: payload.productId,
        quantity: payload.quantity,
        transactionDate: payload.transactionDate,
        note: payload.note
      });
      return;
    }
    await wait();
    const from = findStock(payload.fromBranchId, payload.productId);
    if (!from || from.availableQuantity < payload.quantity) {
      throw new Error("Ton kho nguon khong du de chuyen");
    }
    const to = ensureStock(payload.toBranchId, payload.productId, from.averageCost);
    from.quantityOnHand -= payload.quantity;
    to.quantityOnHand += payload.quantity;
    from.availableQuantity = from.quantityOnHand - from.reservedQuantity;
    to.availableQuantity = to.quantityOnHand - to.reservedQuantity;
    from.updatedAt = payload.transactionDate;
    to.updatedAt = payload.transactionDate;
    addTransaction("TRANSFER_OUT", payload.transactionNo, payload.transactionDate, payload.productId, payload.fromBranchId, payload.toBranchId, payload.quantity, payload.note);
  },

  async stockCount(payload: StockCountPayload): Promise<void> {
    if (!enableMock) {
      await api.post("/api/inventory/stocktake", {
        branchId: payload.branchId,
        warehouseId: payload.warehouseId,
        productId: payload.productId,
        countedQuantity: payload.countedQuantity,
        transactionDate: payload.transactionDate,
        note: payload.note
      });
      return;
    }
    await wait();
    const item = ensureStock(payload.branchId, payload.productId, 0);
    item.quantityOnHand = payload.countedQuantity;
    item.availableQuantity = item.quantityOnHand - item.reservedQuantity;
    item.updatedAt = payload.transactionDate;
    addTransaction("STOCKTAKE", payload.transactionNo, payload.transactionDate, payload.productId, undefined, payload.branchId, payload.countedQuantity, payload.note);
  }
};

function stock(id: number, branchId: number, productId: keyof typeof productNames, quantity: number, minimum: number, cost: number): InventoryStock {
  const product = productNames[productId];
  return {
    id,
    branchId,
    branchName: branchName(branchId),
    productId,
    ...product,
    warehouseId: branchId * 10 + 1,
    warehouseName: `${branchName(branchId)} - Kho chinh`,
    quantityOnHand: quantity,
    reservedQuantity: 0,
    availableQuantity: quantity,
    minimumStock: minimum,
    maxQuantity: minimum * 5,
    averageCost: cost,
    updatedAt: "2026-06-06"
  };
}

function tx(id: number, type: InventoryTransactionType, transactionNo: string, date: string, productId: keyof typeof productNames, fromBranchId: number | undefined, toBranchId: number | undefined, quantity: number, note: string): InventoryTransaction {
  const product = productNames[productId];
  return {
    id,
    type,
    transactionNo,
    transactionDate: date,
    ...product,
    fromBranchId,
    toBranchId,
    fromBranchName: fromBranchId ? branchName(fromBranchId) : undefined,
    toBranchName: toBranchId ? branchName(toBranchId) : undefined,
    quantity,
    note
  };
}

function normalizeTransaction(transaction: InventoryTransaction): InventoryTransaction {
  return {
    ...transaction,
    productCode: transaction.productCode ?? String(transaction.productName ?? transaction.id),
    fromBranchName: transaction.fromBranchId ? branchName(transaction.fromBranchId) : transaction.fromBranchName,
    toBranchName: transaction.toBranchId ? branchName(transaction.toBranchId) : transaction.toBranchName,
    note: transaction.note ?? ""
  };
}

function addTransaction(type: InventoryTransactionType, transactionNo: string, date: string, productId: number, fromBranchId: number | undefined, toBranchId: number | undefined, quantity: number, note: string) {
  const nextId = Math.max(0, ...transactions.map((item) => item.id)) + 1;
  transactions = [tx(nextId, type, transactionNo, date, productId as keyof typeof productNames, fromBranchId, toBranchId, quantity, note), ...transactions];
}

function ensureStock(branchId: number, productId: number, averageCost: number) {
  const current = findStock(branchId, productId);
  if (current) return current;
  const next = stock(Math.max(...stocks.map((item) => item.id)) + 1, branchId, productId as keyof typeof productNames, 0, 5, averageCost);
  stocks = [...stocks, next];
  return next;
}

function findStock(branchId: number, productId: number) {
  return stocks.find((item) => item.branchId === branchId && item.productId === productId);
}

function branchName(branchId: number) {
  return branches.find((item) => item.id === branchId)?.name ?? "Khong xac dinh";
}

function paginate<T>(items: T[], page: number, pageSize: number): PageResponse<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page, pageSize, totalItems, totalPages };
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 350));
}
