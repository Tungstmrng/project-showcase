const registerForm = document.getElementById("registerForm");

if (registerForm) {

    const registerMessage = document.getElementById("message");

    registerForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            registerMessage.textContent = "Passwords do not match!";
            registerMessage.style.color = "red";
            return;
        }

        const submitButton = registerForm.querySelector("button");
        submitButton.disabled = true;
        submitButton.textContent = "Creating Account...";

        try {

            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (error) throw error;

            registerMessage.style.color = "green";

            if (data.session) {
                registerMessage.textContent =
                    "Registration successful! You are now logged in.";
            } else {
                registerMessage.textContent =
                    "Registration successful! Please check your email to verify your account.";
            }

            registerForm.reset();

        } catch (error) {

            registerMessage.textContent = error.message;
            registerMessage.style.color = "red";

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Create Account";

        }

    });

}

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    const loginMessage = document.getElementById("loginMessage");

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const submitButton = loginForm.querySelector("button");

        submitButton.disabled = true;
        submitButton.textContent = "Logging in...";

        try {

            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            console.log("Login successful:", data.user);

            loginMessage.style.color = "green";
            loginMessage.textContent = "Login successful! Redirecting...";

            window.location.href = "../index.html";

        } catch (error) {

            loginMessage.style.color = "red";
            loginMessage.textContent = error.message;

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Login";

        }

    });

}

async function logout() {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error("Logout failed:", error.message);
        return;
    }

    window.location.href = "/index.html";
}

const logoutLink = document.getElementById("logoutLink");

if (logoutLink) {

    logoutLink.addEventListener("click", function(event) {

        event.preventDefault();

        logout();

    });

}


function updateNavbar(session) {

    const addProjectLink = document.getElementById("addProjectLink");
    const registerLink = document.getElementById("registerLink");
    const loginLink = document.getElementById("loginLink");
    const logoutLink = document.getElementById("logoutLink");

    const isLoggedIn = !!session;

    if (addProjectLink) {
        addProjectLink.hidden = !isLoggedIn;
    }

    if (registerLink) {
        registerLink.hidden = isLoggedIn;
    }

    if (loginLink) {
        loginLink.hidden = isLoggedIn;
    }

    if (logoutLink) {
        logoutLink.hidden = !isLoggedIn;
    }

}


supabaseClient.auth.onAuthStateChange((event, session) => {

    updateNavbar(session);

    const isProtectedPage =
        document.body.dataset.requiresAuth === "true";

    const redirectIfAuthenticated =
        document.body.dataset.redirectIfAuthenticated === "true";

    // Redirect if user logs out from a protected page
    if (event === "SIGNED_OUT" && isProtectedPage) {
        window.location.replace("/html/login.html");
        return;
    }

    // Redirect if user logs in from login/register page
    if (event === "SIGNED_IN" && redirectIfAuthenticated) {
        window.location.replace("/index.html");
    }

});


async function checkAuth() {

    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error("Session check failed:", error.message);
        return;
    }

    const session = data.session;

    // Update navbar
    updateNavbar(session);

    // Check if this page requires authentication
    const isProtectedPage =
        document.body.dataset.requiresAuth === "true";

    // Check if logged-in users should leave this page
    const redirectIfAuthenticated =
        document.body.dataset.redirectIfAuthenticated === "true";

    // Redirect users who are not logged in
    if (isProtectedPage && !session) {
        window.location.replace("/html/login.html");
        return;
    }

    // Redirect users who are already logged in
    if (redirectIfAuthenticated && session) {
        window.location.replace("/index.html");
    }
}

checkAuth();