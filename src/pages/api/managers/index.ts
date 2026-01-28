// pages/api/managers/index.ts
import { createApiHandler } from "@/utils/apiHandler";
import { readJsonFile, writeJsonFile, getNextId } from "@/lib/dataService";
import { z } from "zod";

const MANAGER_FILE = "managers.json";

export interface Manager {
    id: number;
    name: string;
    email: string;
}

const managerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email().optional().or(z.literal("")),
});

export default createApiHandler({
    GET: {
        handler: async (req, res) => {
            const managers = readJsonFile<Manager>(MANAGER_FILE);
            res.status(200).json(managers);
        },
    },
    POST: {
        schema: managerSchema,
        handler: async (req, res) => {
            const managers = readJsonFile<Manager>(MANAGER_FILE);
            const { name, email } = req.body; // Typed by schema

            const newManager: Manager = {
                id: getNextId(managers),
                name,
                email: email || "",
            };

            managers.push(newManager);
            writeJsonFile(MANAGER_FILE, managers);
            res.status(201).json(newManager);
        },
    },
});
