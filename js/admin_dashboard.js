
const requestList = document.getElementById("requestList");
const message = document.getElementById("message");
const refreshButton = document.getElementById("refreshButton");

let currentUser = null;

// Check whether the current user is an administrator
async function checkAdmin() {
    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        window.location.href = "login.html";
        return false;
    }

    currentUser = user;

    const { data: admin, error } = await supabaseClient
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        console.error(error);
        message.textContent = "Unable to verify administrator access.";
        return false;
    }

    if (!admin) {
        message.textContent = "Access denied. Admins only.";
        requestList.innerHTML = "";
        return false;
    }

    return true;
}


// Retrieve access requests
async function loadRequests() {
    requestList.textContent = "Loading requests...";
    message.textContent = "";

    const { data, error } = await supabaseClient.rpc(
        "get_project_access_requests"
    );

    if (error) {
        console.error(error);
        requestList.textContent = "Failed to load requests.";
        return;
    }

    displayRequests(data);
}


// Display requests on the page
function displayRequests(requests) {
    requestList.innerHTML = "";

    if (!requests || requests.length === 0) {
        requestList.textContent = "No access requests found.";
        return;
    }

    requests.forEach((request) => {
        const card = document.createElement("div");
        card.className = "request-card";

        const email = document.createElement("h3");
        email.textContent = request.user_email || "Unknown user";

        const reason = document.createElement("p");
        reason.textContent = request.reason;

        const status = document.createElement("p");
        status.textContent = `Status: ${request.status}`;

        const date = document.createElement("p");
        date.textContent =
            `Submitted: ${new Date(request.created_at).toLocaleString()}`;

        card.append(email, reason, status, date);

        if (request.status === "pending") {
            const approveButton = document.createElement("button");
            approveButton.textContent = "Approve";

            const rejectButton = document.createElement("button");
            rejectButton.textContent = "Reject";

            approveButton.addEventListener("click", () => {
                reviewRequest(request.id, "approved");
            });

            rejectButton.addEventListener("click", () => {
                reviewRequest(request.id, "rejected");
            });

            card.append(approveButton, rejectButton);
        }

        requestList.appendChild(card);
    });
}


// Approve or reject a request
async function reviewRequest(requestId, newStatus) {
    const confirmed = confirm(
        `Are you sure you want to ${newStatus} this request?`
    );

    if (!confirmed) return;

    message.textContent = "Updating request...";

    const { data, error } = await supabaseClient
        .from("project_access_requests")
        .update({
            status: newStatus,
            reviewed_at: new Date().toISOString(),
            reviewed_by: currentUser.id
        })
        .eq("id", requestId)
        .eq("status", "pending")
        .select();

    if (error) {
        console.error(error);
        message.textContent = "Failed to update request.";
        return;
    }

    if (!data || data.length === 0) {
        message.textContent =
            "Request was not updated. It may have already been reviewed.";
        return;
    }

    message.textContent =
        `Request successfully ${newStatus}!`;

    await loadRequests();
}


// Refresh button
refreshButton.addEventListener("click", loadRequests);


// Initialize dashboard
async function initializeDashboard() {
    const isAdmin = await checkAdmin();

    if (isAdmin) {
        await loadRequests();
    }
}

initializeDashboard();
