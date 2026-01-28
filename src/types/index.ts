
export interface Product {
    id: number;
    slug: string;
    sku: string;
    name: string;
    categoryId: string;
    unitCost: number;
    reorderPoint: number;
    description?: string;
    image?: string;
}

export interface Stock {
    id: number;
    productId: number;
    warehouseId: number;
    quantity: number;
}

export interface Warehouse {
    id: number;
    name: string;
    location: string;
    code: string;
}

export interface ProductWithStock extends Product {
    currentStock: number;
    stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
    stockHealth: number;
}
