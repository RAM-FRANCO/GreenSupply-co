import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "node:fs";
import path from "node:path";

export const config = {
    api: {
        bodyParser: false,
    },
};

const uploadDir = path.join(process.cwd(), "public/uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const form = formidable({
        uploadDir,
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        filter: ({ mimetype }) => {
            return !!mimetype && mimetype.includes("image");
        },
        filename: (_name, _ext, part) => {
            return `${Date.now()}_${part.originalFilename}`;
        }
    });

    try {
        const [, files] = await form.parse(req);
        // formidable v3 produces File[] for single files too?
        // It depends on options. But assuming standard formidable types:
        const file = Array.isArray(files.file) ? files.file[0] : (files.file as File | undefined);

        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const fileName = file.newFilename;
        const publicUrl = `/uploads/${fileName}`;

        return res.status(200).json({ url: publicUrl });

    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ message: "File upload failed" });
    }
}
