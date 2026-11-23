
const projectForm = document.getElementById("projectForm");
const projectMessage = document.getElementById("projectMessage");

const accessStatus = document.getElementById("accessStatus");
const requestAccessSection = document.getElementById("requestAccessSection");
const projectFormContainer = document.getElementById("projectFormContainer");

let currentUser = null;


// ==========================================
// CHECK USER ACCESS
// ==========================================

async function checkProjectAccess() {

    try {

        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            window.location.href = "/html/login.html";
            return;
        }

        currentUser = user;

        // Check administrator status
        const { data: admin, error: adminError } =
            await supabaseClient
                .from("admin_users")
                .select("user_id")
                .eq("user_id", user.id)
                .maybeSingle();

        if (adminError) throw adminError;

        if (admin) {
            showProjectForm("Administrator access granted!");
            return;
        }

        // Check approved request first
        const { data: approvedRequest, error: approvedError } =
            await supabaseClient
                .from("project_access_requests")
                .select("id")
                .eq("user_id", user.id)
                .eq("status", "approved")
                .limit(1)
                .maybeSingle();

        if (approvedError) throw approvedError;

        if (approvedRequest) {
            showProjectForm("Your contributor access has been approved!");
            return;
        }

        // Check pending request
        const { data: pendingRequest, error: pendingError } =
            await supabaseClient
                .from("project_access_requests")
                .select("id")
                .eq("user_id", user.id)
                .eq("status", "pending")
                .maybeSingle();

        if (pendingError) throw pendingError;

        if (pendingRequest) {
            accessStatus.textContent =
                "Your access request is currently pending approval.";
            return;
        }

        // Check previous rejected request
        const { data: rejectedRequest, error: rejectedError } =
            await supabaseClient
                .from("project_access_requests")
                .select("id")
                .eq("user_id", user.id)
                .eq("status", "rejected")
                .limit(1)
                .maybeSingle();

        if (rejectedError) throw rejectedError;

        if (rejectedRequest) {
            accessStatus.textContent =
                "Your previous request was rejected. You can request access again.";
        } else {
            accessStatus.textContent =
                "You need contributor permission before uploading projects.";
        }

        requestAccessSection.hidden = false;

    } catch (error) {

        console.error("Access check error:", error);

        accessStatus.textContent =
            "Unable to check your access. Please try again.";

    }
}


// ==========================================
// SHOW PROJECT FORM
// ==========================================

function showProjectForm(statusText) {

    accessStatus.textContent = statusText;

    projectFormContainer.hidden = false;

    requestAccessSection.hidden = true;

}


// ==========================================
// CHECK UPLOAD PERMISSION AGAIN
// ==========================================

async function verifyUploadPermission() {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        throw new Error("Please log in first.");
    }

    // Check admin
    const { data: admin, error: adminError } =
        await supabaseClient
            .from("admin_users")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();

    if (adminError) throw adminError;

    if (admin) return user;

    // Check approved contributor
    const { data: approved, error: approvedError } =
        await supabaseClient
            .from("project_access_requests")
            .select("id")
            .eq("user_id", user.id)
            .eq("status", "approved")
            .limit(1)
            .maybeSingle();

    if (approvedError) throw approvedError;

    if (!approved) {
        throw new Error("You don't have permission to upload projects.");
    }

    return user;
}


// ==========================================
// SUBMIT PROJECT
// ==========================================

if (projectForm) {

    projectForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const submitButton = projectForm.querySelector(
            'button[type="submit"]'
        );

        const title = document
            .getElementById("projectTitle")
            .value.trim();

        const category = document
            .getElementById("projectCategory")
            .value;

        const description = document
            .getElementById("projectDescription")
            .value.trim();

        const technology = document
            .getElementById("projectTechnology")
            .value.trim();

        const projectUrl = document
            .getElementById("projectUrl")
            .value.trim();

        const image = document
            .getElementById("projectImage")
            .files[0];


        // Validate image
        if (!image) {
            projectMessage.textContent =
                "Please select a project image.";
            projectMessage.style.color = "red";
            return;
        }

        // Allow JPG, PNG and WebP
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(image.type)) {
            projectMessage.textContent =
                "Please upload a JPG, PNG, or WebP image.";
            projectMessage.style.color = "red";
            return;
        }

        // Maximum image size: 5 MB
        if (image.size > 5 * 1024 * 1024) {
            projectMessage.textContent =
                "Image size must be less than 5 MB.";
            projectMessage.style.color = "red";
            return;
        }

        // Validate project URL
        if (projectUrl) {

            try {

                const url = new URL(projectUrl);

                if (!["http:", "https:"].includes(url.protocol)) {
                    throw new Error("Invalid URL");
                }

            } catch {

                projectMessage.textContent =
                    "Please enter a valid project URL.";

                projectMessage.style.color = "red";
                return;

            }
        }

        if (!title || !category || !description || !technology) {
            projectMessage.textContent =
                "Please complete all required fields.";
            projectMessage.style.color = "red";
            return;
        }


        submitButton.disabled = true;
        submitButton.textContent = "Uploading...";

        projectMessage.textContent =
            "Please wait while your project is being uploaded.";

        projectMessage.style.color = "blue";

        let uploadedFilePath = null;

        try {

            // 1. Verify permission
            const user = await verifyUploadPermission();

            // 2. Prepare image filename
            const safeFileName = image.name.replace(
                /[^a-zA-Z0-9._-]/g,
                "_"
            );

            const filePath =
                `${user.id}/${Date.now()}-${safeFileName}`;

            // 3. Upload image to Supabase Storage
            const { error: uploadError } = await supabaseClient
                .storage
                .from("project-images")
                .upload(filePath, image, {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: image.type
                });

            if (uploadError) throw uploadError;

            uploadedFilePath = filePath;

            // 4. Get public image URL
            const { data: imageData } = supabaseClient
                .storage
                .from("project-images")
                .getPublicUrl(filePath);

            const imageUrl = imageData.publicUrl;

            // 5. Convert technologies into an array
            const technologies = technology
                .split(",")
                .map(item => item.trim())
                .filter(item => item.length > 0);

            // 6. Insert project into database
            const { error: insertError } = await supabaseClient
                .from("projects")
                .insert({
                    user_id: user.id,
                    title: title,
                    description: description,
                    category: category,
                    technologies: technologies,
                    image_url: imageUrl,
                    project_url: projectUrl || null
                });

            if (insertError) throw insertError;

            // 7. Success
            projectMessage.textContent =
                "Your project has been uploaded successfully!";

            projectMessage.style.color = "green";

            projectForm.reset();

            uploadedFilePath = null;

        } catch (error) {

            console.error("Project upload error:", error);

            // Remove image if database insertion fails
            if (uploadedFilePath) {

                const { error: removeError } = await supabaseClient
                    .storage
                    .from("project-images")
                    .remove([uploadedFilePath]);

                if (removeError) {
                    console.error("Image cleanup error:", removeError);
                }

            }

            projectMessage.textContent =
                error.message || "Failed to upload project.";

            projectMessage.style.color = "red";

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Submit Project";

        }

    });

}


// ==========================================
// INITIALIZE PAGE
// ==========================================

checkProjectAccess();
