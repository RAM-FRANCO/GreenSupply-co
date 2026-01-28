import * as z from "zod";

// Define schema for validation
export const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    icon: z.string().min(1, "Icon name is required"),
    color: z.string().min(1, "Color is required"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
