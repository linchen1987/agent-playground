import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import os from "os";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    let requestedPath = searchParams.get("path");

    // Default to homedir if no path provided
    if (!requestedPath) {
        requestedPath = os.homedir();
    }

    // Security/Validation: Ensure we are accessing allowed paths?
    // For this local agent tool, we exercise basic caution but allow homedir access as requested.
    // We resolve the path to handle potential '..' or relative components if any invoke it weirdly
    // but typically we expect absolute paths from our own UI.

    // If the path starts with ~, expand it (though our UI should probably send absolute paths)
    if (requestedPath.startsWith("~")) {
        requestedPath = requestedPath.replace(/^~/, os.homedir());
    }

    try {
        const stats = await fs.stat(requestedPath);
        if (!stats.isDirectory()) {
            return NextResponse.json({ error: "Path is not a directory" }, { status: 400 });
        }

        const dirents = await fs.readdir(requestedPath, { withFileTypes: true });

        // Filter only directories as per requirement to select "projects" (usually folders)
        // We might want to see files too to know where we are, but the prompt says 
        // "select any directory... as a project".
        // Let's return directories primarily.

        // We also need to handle hidden files/dirs usually?
        // Let's filter out hidden ones (starting with .) unless requested? 
        // The user has .gemini, .local etc. which might be relevant. 
        // Let's keep them but maybe just filter out standard ignored ones if the list is huge.
        // For now, raw list is safer.

        const directories = dirents
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

        // Return absolute path to help frontend know where it is
        return NextResponse.json({
            path: path.resolve(requestedPath),
            directories,
        });
    } catch (error) {
        console.error("Error listing directory:", error);
        return NextResponse.json(
            { error: "Failed to list directory", details: String(error) },
            { status: 500 }
        );
    }
}
