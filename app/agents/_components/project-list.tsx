"use client";

import { useState, useEffect } from "react";
import { Plus, Folder, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectSelector } from "./project-selector";
import { cn } from "@/lib/utils";

interface ProjectListProps {
    selectedPath: string | null;
    onSelectPath: (path: string) => void;
}

export function ProjectList({ selectedPath, onSelectPath }: ProjectListProps) {
    const [projects, setProjects] = useState<string[]>([]);
    const [selectorOpen, setSelectorOpen] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("agent_projects");
        if (saved) {
            try {
                setProjects(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse projects", e);
            }
        }
    }, []);

    const saveProjects = (newProjects: string[]) => {
        setProjects(newProjects);
        localStorage.setItem("agent_projects", JSON.stringify(newProjects));
    };

    const handleAddProject = (path: string) => {
        if (!projects.includes(path)) {
            const newProjects = [...projects, path];
            saveProjects(newProjects);
        }
        onSelectPath(path);
    };

    const removeProject = (e: React.MouseEvent, path: string) => {
        e.stopPropagation();
        const newProjects = projects.filter(p => p !== path);
        saveProjects(newProjects);
        if (selectedPath === path) {
            onSelectPath(newProjects[0] || null);
        }
    };

    return (
        <div className="w-64 border-r bg-muted/20 flex flex-col h-full">
            <div className="p-4 flex items-center justify-between border-b">
                <h2 className="font-semibold text-sm">Projects</h2>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setSelectorOpen(true)}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {projects.map((path) => {
                    const name = path.split("/").pop() || path;
                    const isActive = selectedPath === path;

                    return (
                        <div
                            key={path}
                            className={cn(
                                "group flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-accent/50 transition-colors",
                                isActive && "bg-accent text-accent-foreground"
                            )}
                            onClick={() => onSelectPath(path)}
                            title={path}
                        >
                            <Folder className="h-4 w-4 shrink-0 opacity-70" />
                            <span className="truncate flex-1">{name}</span>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => removeProject(e, path)}
                            >
                                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            </Button>
                        </div>
                    );
                })}

                {projects.length === 0 && (
                    <div className="text-xs text-muted-foreground p-2 text-center">
                        No projects added.<br />Click + to add one.
                    </div>
                )}
            </div>

            <ProjectSelector
                open={selectorOpen}
                onOpenChange={setSelectorOpen}
                onSelect={handleAddProject}
            />
        </div>
    );
}
