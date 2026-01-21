
export interface Product {
    id: number;
    sku: string;
    name: string;
    category: string;
    unitCost: number;
    reorderPoint: number;
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
