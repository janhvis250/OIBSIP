// ===============================
// SecureAuth - Login System
// ===============================

const USERS_KEY = "secureAuthUsers";
const SESSION_KEY = "secureAuthSession";

// Forms
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const dashboard = document.getElementById("dashboard");

// Login elements
const login = document.getElementById("login");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");

// Register elements
const register = document.getElementById("register");
const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const confirmPassword = document.getElementById("confirmPassword");
const registerMessage = document.getElementById("registerMessage");

// Password rules
const lengthRule = document.getElementById("lengthRule");
const numberRule = document.getElementById("numberRule");

// Dashboard
const dashboardName = document.getElementById("dashboardName");
const dashboardEmail = document.getElementById("dashboardEmail");
const logoutBtn = document.getElementById("logoutBtn");

// Form switching
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");


// ===============================
// LocalStorage Helpers
// ===============================

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}


// ===============================
// SHA-256 Password Hashing
// ===============================

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}


// ===============================
// Password Validation
// ===============================

function isValidPassword(password) {
    return password.length >= 8 && /\d/.test(password);
}

function updatePasswordRules() {
    const password = registerPassword.value;

    const hasLength = password.length >= 8;
    const hasNumber = /\d/.test(password);

    lengthRule.classList.toggle("valid", hasLength);
    numberRule.classList.toggle("valid", hasNumber);
}

registerPassword.addEventListener("input", updatePasswordRules);


// ===============================
// Show / Hide Password
// ===============================

document.querySelectorAll(".password-toggle").forEach(button => {
    button.addEventListener("click", () => {
        const targetId = button.dataset.target;
        const input = document.getElementById(targetId);

        if (input.type === "password") {
            input.type = "text";
            button.textContent = "Hide";
        } else {
            input.type = "password";
            button.textContent = "Show";
        }
    });
});


// ===============================
// Switch Login / Register
// ===============================

showRegister.addEventListener("click", () => {
    loginForm.classList.remove("active");
    registerForm.classList.add("active");

    loginError.textContent = "";
    registerMessage.textContent = "";
});

showLogin.addEventListener("click", () => {
    registerForm.classList.remove("active");
    loginForm.classList.add("active");

    loginError.textContent = "";
    registerMessage.textContent = "";
});


// ===============================
// Registration
// ===============================

register.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = registerName.value.trim();
    const email = registerEmail.value.trim().toLowerCase();
    const password = registerPassword.value;
    const confirm = confirmPassword.value;

    registerMessage.className = "form-message";
    registerMessage.textContent = "";

    // Basic validation
    if (!name || !email || !password || !confirm) {
        registerMessage.textContent = "Please fill in all fields.";
        return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        registerMessage.textContent = "Please enter a valid email address.";
        return;
    }

    // Password validation
    if (!isValidPassword(password)) {
        registerMessage.textContent =
            "Password must be at least 8 characters and contain at least 1 number.";
        return;
    }

    // Confirm password
    if (password !== confirm) {
        registerMessage.textContent = "Passwords do not match.";
        return;
    }

    // Get existing users
    const users = getUsers();

    // Duplicate email check
    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        registerMessage.textContent =
            "An account with this email already exists.";
        return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new user
    const newUser = {
        name: name,
        email: email,
        passwordHash: passwordHash
    };

    users.push(newUser);

    // Save user
    saveUsers(users);

    // Success message
    registerMessage.classList.add("success");
    registerMessage.textContent =
        "Account created successfully. You can sign in now.";

    // Reset registration form
    register.reset();
    updatePasswordRules();

    // Switch to login after short delay
    setTimeout(() => {
        registerForm.classList.remove("active");
        loginForm.classList.add("active");

        loginEmail.value = email;
        loginPassword.focus();

        registerMessage.textContent = "";
        registerMessage.className = "form-message";
    }, 1200);
});


// ===============================
// Login
// ===============================

login.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = loginEmail.value.trim().toLowerCase();
    const password = loginPassword.value;

    loginError.textContent = "";

    if (!email || !password) {
        loginError.textContent = "Please enter your email and password.";
        return;
    }

    const users = getUsers();

    const user = users.find(existingUser => existingUser.email === email);

    // Generic error
    if (!user) {
        loginError.textContent = "Incorrect email or password.";
        return;
    }

    // Hash entered password
    const passwordHash = await hashPassword(password);

    // Compare hashed passwords
    if (passwordHash !== user.passwordHash) {
        loginError.textContent = "Incorrect email or password.";
        return;
    }

    // Create session
    const session = {
        email: user.email
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    // Show dashboard
    showDashboard(user);
});


// ===============================
// Show Dashboard
// ===============================

function showDashboard(user) {
    loginForm.classList.remove("active");
    registerForm.classList.remove("active");

    dashboard.classList.add("active");

    dashboardName.textContent = user.name;
    dashboardEmail.textContent = user.email;
}


// ===============================
// Logout
// ===============================

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);

    dashboard.classList.remove("active");
    loginForm.classList.add("active");

    login.reset();
    loginError.textContent = "";

    loginEmail.focus();
});


// ===============================
// Protect Dashboard on Page Load
// ===============================

function checkSession() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));

    if (!session || !session.email) {
        loginForm.classList.add("active");
        dashboard.classList.remove("active");
        return;
    }

    const users = getUsers();

    const user = users.find(
        existingUser => existingUser.email === session.email
    );

    // Remove invalid/stale session
    if (!user) {
        localStorage.removeItem(SESSION_KEY);
        loginForm.classList.add("active");
        dashboard.classList.remove("active");
        return;
    }

    showDashboard(user);
}


// Run session check
checkSession();