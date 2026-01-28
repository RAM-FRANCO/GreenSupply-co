import type { NextApiRequest, NextApiResponse } from "next";
import { ZodType } from "zod";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RouteConfig<Body, Query> {
    schema?: ZodType<Body>;
    querySchema?: ZodType<Query>;
    handler: (
        req: NextApiRequest & { body: Body; query: Query },
        res: NextApiResponse
    ) => Promise<void> | void;
}

type ApiHandlerConfig = Partial<Record<HttpMethod, RouteConfig<unknown, unknown>>>;

export function createApiHandler(handlers: ApiHandlerConfig) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            const method = req.method as HttpMethod;
            const routeConfig = handlers[method];

            // 1. Check if method is supported
            if (!routeConfig) {
                res.setHeader("Allow", Object.keys(handlers));
                return res.status(405).json({ message: `Method ${method} Not Allowed` });
            }

            const { schema, querySchema, handler } = routeConfig;

            // 2. Body Validation
            if (schema) {
                const result = schema.safeParse(req.body);
                if (!result.success) {
                    return res.status(400).json({
                        message: "Validation Error",
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        errors: (result.error as any).errors, // Cast result.error to any
                    });
                }
                req.body = result.data;
            }

            // 3. Query Validation
            if (querySchema) {
                const result = querySchema.safeParse(req.query);
                if (!result.success) {
                    return res.status(400).json({
                        message: "Invalid Query Parameters",
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        errors: (result.error as any).errors, // Cast result.error to any
                    });
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                req.query = result.data as any; // Cast result.data to any
            }

            // 4. Execute Handler
            // We cast req because we have customized the body/query types
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await handler(req as any, res);
        } catch (error) {
            console.error("API Error:", error);
            // Don't leak stack traces in production, but helpful for dev
            const message =
                error instanceof Error ? error.message : "Internal Server Error";
            return res.status(500).json({ message });
        }
    };
}
