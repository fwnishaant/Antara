import { store } from '@/lib/db/store';
import { Product } from '@/types';
import { DatabaseClient } from './client';

export class ProductsRepository {
  public static async getAllProducts(): Promise<Product[]> {
    return DatabaseClient.queryTable<Product>('products', () => store.getProducts());
  }

  public static async getProductById(id: string): Promise<Product | undefined> {
    const products = await this.getAllProducts();
    return products.find((p) => p.id === id);
  }

  public static async searchProducts(params: {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'relevance';
    limit?: number;
  }): Promise<Product[]> {
    let products = await this.getAllProducts();

    if (params.category) {
      const catLower = params.category.toLowerCase();
      products = products.filter(
        (p) => p.category.toLowerCase() === catLower || p.name.toLowerCase().includes(catLower)
      );
    }

    if (params.query) {
      const qLower = params.query.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(qLower) ||
          p.description.toLowerCase().includes(qLower) ||
          p.category.toLowerCase().includes(qLower) ||
          p.tags.some((t) => t.toLowerCase().includes(qLower))
      );
    }

    if (params.minPrice !== undefined) {
      products = products.filter((p) => p.price >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
      products = products.filter((p) => p.price <= params.maxPrice!);
    }

    if (params.sortBy === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (params.sortBy === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (params.sortBy === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    }

    return params.limit ? products.slice(0, params.limit) : products;
  }

  public static async getCheapestProduct(category?: string): Promise<Product> {
    const products = await this.searchProducts({ category, sortBy: 'price_asc' });
    const all = await this.getAllProducts();
    return products[0] || all[0];
  }

  public static async getMostExpensiveProduct(category?: string): Promise<Product> {
    const products = await this.searchProducts({ category, sortBy: 'price_desc' });
    const all = await this.getAllProducts();
    return products[0] || all[0];
  }

  public static async compareProducts(idA: string, idB: string): Promise<{ productA?: Product; productB?: Product; priceDifference: number }> {
    const prodA = await this.getProductById(idA);
    const prodB = await this.getProductById(idB);
    const priceDifference = prodA && prodB ? Math.abs(prodA.price - prodB.price) : 0;

    return {
      productA: prodA,
      productB: prodB,
      priceDifference,
    };
  }
}
