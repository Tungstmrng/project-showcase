async function loadProjects() {
    const container =
        document.getElementById("projectList") ||
        document.getElementById("gallery");

    const status = document.getElementById("projectStatus");

    if (!container) return;

    const { data: projects, error } = await supabaseClient
        .from("projects")
        .select("id, title, category, description, technologies, image_url, project_url, created_at")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Load projects error:", error);
        if (status) status.textContent = "Failed to load projects.";
        return;
    }

    if (!projects || projects.length === 0) {
        if (status) status.textContent = "No projects available.";
        return;
    }

    if (status) status.textContent = "";

    projects.forEach(project => {
        const card = document.createElement("div");
        card.className = "project-card";

        if (project.image_url) {
            const img = document.createElement("img");
            img.src = project.image_url;
            img.alt = project.title;
            card.appendChild(img);
        }

        const title = document.createElement("h3");
        title.textContent = project.title;
        card.appendChild(title);

        const info = document.createElement("div");
        info.className = "project-info";

        const category = document.createElement("p");
        category.textContent = project.category;
        info.appendChild(category);

        const description = document.createElement("p");
        description.textContent = project.description;
        info.appendChild(description);

        const tech = document.createElement("p");
        tech.textContent = Array.isArray(project.technologies)
            ? project.technologies.join(", ")
            : "";
        info.appendChild(tech);

        if (project.project_url) {
            const link = document.createElement("a");
            link.href = project.project_url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.className = "link-button";
            link.textContent = "Visit Project";
            info.appendChild(link);
        }

        card.appendChild(info);
        container.appendChild(card);
    });
}

loadProjects();