import { api } from "@/lib/api/axios";
import type { PageResponse, Product, ProductEffectivePrice, ProductListParams, ProductPayload, ProductPriceHistory } from "./types";

export const productsApi = {
  async list(params: ProductListParams): Promise<PageResponse<Product>> {
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
  },

  async create(payload: ProductPayload): Promise<Product> {
    const response = await api.post<Product>("/api/products", payload);
    return normalizeProduct(response.data);
  },

  async update(id: number, payload: ProductPayload): Promise<Product> {
    const response = await api.put<Product>(`/api/products/${id}`, payload);
    return normalizeProduct(response.data);
  },

  async softDelete(id: number): Promise<void> {
    await api.delete(`/api/products/${id}`);
  },

  async effectivePrice(id: number): Promise<ProductEffectivePrice> {
    const response = await api.get<ProductEffectivePrice>("/api/price-policies/active-price", {
      params: { productId: id }
    });
    return response.data;
  },

  async priceHistory(id: number): Promise<ProductPriceHistory[]> {
    const response = await api.get<ProductPriceHistory[]>(`/api/products/${id}/price-history`);
    return response.data;
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
