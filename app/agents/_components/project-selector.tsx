"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Folder, ArrowUp, Loader2 } from "lucide-react";

interface ProjectSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (path: string) => void;
}

export function ProjectSelector({ open, onOpenChange, onSelect }: ProjectSelectorProps) {
    const [currentPath, setCurrentPath] = useState<string>("");
    const [directories, setDirectories] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchDirectories = async (path?: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (path) params.set("path", path);

            const res = await fetch(`/api/fs/list?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to list directories");

            const data = await res.json();
            setCurrentPath(data.path);
            setDirectories(data.directories);
        } catch (error) {
            console.error(error);
            // Ideally show toast error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchDirectories(currentPath || undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleNavigate = (dir: string) => {
        // Construct new path. This is a bit naive for cross-platform but works for now if API handles it well.
        // Actually API returns absolute path, so we can just join cleanly or let API handle it?
        // Let's just append and let API resolve.
        // Better: We don't have the full path of the child here, just the name.
        // So we rely on currentPath + separator + dir.
        // To match server side, maybe we should just send the safe joined path?
        // Let's assume unix style separator for web or rely on what API returned.
        // Actually, `currentPath` from API is absolute.
        // We can concatenate with `/` since this runs in browser, but the server is likely same OS.
        // User is on Mac, so `/` is fine.

        // Check if currentPath ends with / to avoid double slash
        const separator = currentPath.endsWith("/") ? "" : "/";
        fetchDirectories(`${currentPath}${separator}${dir}`);
    };

    const handleUp = () => {
        // Naive parent resolution
        if (!currentPath || currentPath === "/") return;
        const parent = currentPath.split("/").slice(0, -1).join("/") || "/";
        fetchDirectories(parent);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select Project Directory</DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-2 p-2 bg-muted rounded-md font-mono text-sm overflow-hidden">
                    <span className="truncate" title={currentPath}>{currentPath || "Loading..."}</span>
                </div>

                <div className="flex-1 overflow-y-auto min-h-[300px] border rounded-md p-2">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <Button
                                variant="ghost"
                                className="justify-start gap-2"
                                onClick={handleUp}
                                disabled={!currentPath || currentPath === "/"}
                            >
                                <ArrowUp className="h-4 w-4" />
                                ..
                            </Button>
                            {directories.map((dir) => (
                                <Button
                                    key={dir}
                                    variant="ghost"
                                    className="justify-start gap-2 font-normal"
                                    onClick={() => handleNavigate(dir)}
                                >
                                    <Folder className="h-4 w-4 text-blue-500" />
                                    {dir}
                                </Button>
                            ))}
                            {directories.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No directories found
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={() => {
                        onSelect(currentPath);
                        onOpenChange(false);
                    }}>
                        Select This Folder
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
