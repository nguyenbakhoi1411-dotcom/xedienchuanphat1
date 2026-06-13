import { api } from "@/lib/api/axios";
import type { PageResponse, Product, ProductEffectivePrice, ProductListParams, ProductPayload, ProductPriceHistory, ProductSerial } from "./types";

const enableMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === "true";

const serials: ProductSerial[] = [
  { id: 1, serialNumber: "CP-S1-00091", status: "IN_STOCK", branchName: "Go Vap" },
  { id: 2, serialNumber: "CP-S1-00092", status: "SOLD", branchName: "Go Vap" },
  { id: 3, serialNumber: "CP-CITY-00418", status: "WARRANTY", branchName: "Thu Duc" }
];

let products: Product[] = [
  {
    id: 1,
    productCode: "CP-S1",
    productName: "Xe may dien CP S1",
    category: "ELECTRIC_MOTORBIKE",
    brand: "Chuan Phat",
    model: "S1",
    color: "Trang cam",
    batteryCapacity: "72V 40Ah",
    motorPower: "1500W",
    importPrice: 11800000,
    salePrice: 15800000,
    warrantyMonths: 24,
    imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800",
    description: "Mau xe may dien chu luc cho khach hang do thi.",
    status: "ACTIVE",
    serials,
    createdAt: "2026-06-01",
    updatedAt: "2026-06-05"
  },
  {
    id: 2,
    productCode: "CP-CITY",
    productName: "Xe may dien CP City",
    category: "ELECTRIC_MOTORBIKE",
    brand: "Chuan Phat",
    model: "City",
    color: "Den",
    batteryCapacity: "60V 32Ah",
    motorPower: "1200W",
    importPrice: 9800000,
    salePrice: 13900000,
    warrantyMonths: 18,
    imageUrl: "",
    description: "Dong xe nho gon, phu hop di lai hang ngay.",
    status: "ACTIVE",
    serials: [serials[2]],
    createdAt: "2026-05-20",
    updatedAt: "2026-06-04"
  },
  {
    id: 3,
    productCode: "PIN-LFP-72",
    productName: "Binh ac quy LFP 72V",
    category: "BATTERY",
    brand: "Chuan Phat",
    model: "LFP-72",
    color: "Xam",
    batteryCapacity: "72V 45Ah",
    motorPower: "N/A",
    importPrice: 4200000,
    salePrice: 6500000,
    warrantyMonths: 12,
    imageUrl: "",
    description: "Pin thay the cho cac dong xe may dien.",
    status: "ACTIVE",
    serials: [],
    createdAt: "2026-04-12",
    updatedAt: "2026-05-30"
  }
];

export const productsApi = {
  async list(params: ProductListParams): Promise<PageResponse<Product>> {
    if (!enableMock) {
      const response = await api.get<PageResponse<Product>>("/api/products", {
        params: {
          keyword: params.keyword,
          category: params.category === "ALL" ? undefined : params.category,
          page: Math.max(params.page - 1, 0),
          pageSize: params.pageSize
        }
      });
      return {
        ...response.data,
        page: response.data.page + 1,
        items: response.data.items.map(normalizeProduct)
      };
    }
    await wait();
    const keyword = params.keyword.trim().toLowerCase();
    const filtered = products
      .filter((item) => item.status !== "DELETED")
      .filter((item) => {
        const matchKeyword =
          keyword.length === 0 ||
          item.productName.toLowerCase().includes(keyword) ||
          item.productCode.toLowerCase().includes(keyword);
        const matchCategory = params.category === "ALL" || item.category === params.category;
        const matchStatus = params.status === "ALL" || item.status === params.status;
        return matchKeyword && matchCategory && matchStatus;
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

  async create(payload: ProductPayload): Promise<Product> {
    if (!enableMock) {
      const response = await api.post<Product>("/api/products", payload);
      return normalizeProduct(response.data);
    }
    await wait();
    if (products.some((item) => item.productCode.toLowerCase() === payload.productCode.toLowerCase())) {
      throw new Error("Ma san pham da ton tai");
    }
    const now = new Date().toISOString().slice(0, 10);
    const product: Product = {
      ...payload,
      id: Math.max(0, ...products.map((item) => item.id)) + 1,
      serials: [],
      createdAt: now,
      updatedAt: now
    };
    products = [product, ...products];
    return product;
  },

  async update(id: number, payload: ProductPayload): Promise<Product> {
    if (!enableMock) {
      const response = await api.put<Product>(`/api/products/${id}`, payload);
      return normalizeProduct(response.data);
    }
    await wait();
    const current = products.find((item) => item.id === id);
    if (!current) {
      throw new Error("Khong tim thay san pham");
    }
    if (products.some((item) => item.id !== id && item.productCode.toLowerCase() === payload.productCode.toLowerCase())) {
      throw new Error("Ma san pham da ton tai");
    }
    const updated: Product = {
      ...current,
      ...payload,
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    products = products.map((item) => (item.id === id ? updated : item));
    return updated;
  },

  async softDelete(id: number): Promise<void> {
    if (!enableMock) {
      await api.delete(`/api/products/${id}`);
      return;
    }
    await wait();
    products = products.map((item) => (item.id === id ? { ...item, status: "DELETED" } : item));
  },

  async effectivePrice(id: number): Promise<ProductEffectivePrice> {
    if (!enableMock) {
      const response = await api.get<ProductEffectivePrice>("/api/price-policies/active-price", {
        params: { productId: id }
      });
      return response.data;
    }
    await wait();
    const product = products.find((item) => item.id === id);
    if (!product) {
      throw new Error("Khong tim thay san pham");
    }
    return {
      productId: id,
      listPrice: product.salePrice,
      effectivePrice: product.salePrice,
      policyDiscountAmount: 0
    };
  },

  async priceHistory(id: number): Promise<ProductPriceHistory[]> {
    if (!enableMock) {
      const response = await api.get<ProductPriceHistory[]>(`/api/products/${id}/price-history`);
      return response.data;
    }
    await wait();
    return [];
  }
};

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    imageUrl: product.imageUrl ?? "",
    description: product.description ?? "",
    serials: product.serials ?? [],
    createdAt: product.createdAt ?? "",
    updatedAt: product.updatedAt ?? ""
  };
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 350));
}
