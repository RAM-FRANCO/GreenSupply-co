import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import type { Stock } from "@/types/inventory";

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Stock | Stock[] | { message: string }>
) {
    const filePath = path.join(process.cwd(), "data", "stock.json");

    try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const stock: Stock[] = JSON.parse(fileContent);

        if (req.method === "GET") {
            res.status(200).json(stock);
        } else if (req.method === "POST") {
            const newStock: Stock = req.body;
            // Simple ID generation based on max ID + 1
            newStock.id = stock.length > 0 ? Math.max(...stock.map((s) => s.id)) + 1 : 1;

            const updatedStock = [...stock, newStock];
            fs.writeFileSync(filePath, JSON.stringify(updatedStock, null, 2));

            res.status(201).json(newStock);
        } else {
            res.setHeader("Allow", ["GET", "POST"]);
            res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
