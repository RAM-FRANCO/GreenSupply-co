import type { Product, Warehouse } from "./inventory";

export type PurchaseOrderStatus = "pending" | "received" | "cancelled";

export interface PurchaseOrder {
    id: number;
    productId: number;
    warehouseId: number;
    quantity: number;
    status: PurchaseOrderStatus;
    orderDate: string;
    receivedDate?: string;

    // Optional enriched fields for frontend display
    product?: Product;
    warehouse?: Warehouse;
}
