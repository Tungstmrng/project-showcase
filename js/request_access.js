
const requestForm = document.getElementById("requestForm");
const reasonInput = document.getElementById("reason");
const message = document.getElementById("message");
const submitButton = document.getElementById("submitButton");

requestForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const reason = reasonInput.value.trim();

    if (!reason) {
        message.textContent = "Please enter your reason.";
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
        // Check logged-in user
        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            message.textContent = "Please log in first.";
            return;
        }

        // Check existing pending request
        const { data: existingRequest, error: checkError } =
            await supabaseClient
                .from("project_access_requests")
                .select("id, status")
                .eq("user_id", user.id)
                .eq("status", "pending")
                .maybeSingle();

        if (checkError) {
            throw checkError;
        }

        if (existingRequest) {
            message.textContent =
                "You already have a pending access request.";
            return;
        }

        // Submit new request
        const { error: insertError } = await supabaseClient
            .from("project_access_requests")
            .insert({
                user_id: user.id,
                reason: reason
            });

        if (insertError) {
            throw insertError;
        }

        message.textContent =
            "Your request has been submitted successfully!";

        reasonInput.value = "";

    } catch (error) {
        console.error("Request error:", error);
        message.textContent =
            "Something went wrong. Please try again.";
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Request";
    }
});
