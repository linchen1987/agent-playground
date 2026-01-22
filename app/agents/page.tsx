"use client";

import { useState, useEffect } from "react";
import { ProjectList } from "./_components/project-list";
import { STORAGE_KEYS } from "@/lib/storage-keys";

export default function AgentsPage() {
    const [selectedProject, setSelectedProject] = useState<string | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.agentProjects);
            if (saved) {
                const list = JSON.parse(saved);
                if (list.length > 0) {
                    setSelectedProject(list[0]);
                }
            }
        } catch {
            console.warn('Failed to load selected project from localStorage');
        }
    }, []);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Left Column */}
            <ProjectList
                selectedPath={selectedProject}
                onSelectPath={setSelectedProject}
            />

            {/* Right Column / Main Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
                {selectedProject ? (
                    <div className="flex-1 p-6 overflow-y-auto">
                        <h1 className="text-2xl font-bold mb-2">
                            {selectedProject.split("/").pop() || selectedProject}
                        </h1>
                        <p className="text-muted-foreground mb-4 font-mono text-sm">
                            {selectedProject}
                        </p>

                        <div className="border rounded-md p-8 text-center text-muted-foreground border-dashed">
                            Main Agent Area for this project.
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Select or add a project to get started
                    </div>
                )}
            </div>
        </div>
    );
}
