```javascript
// User Management CRUD with FastAPI
// GET, POST, PUT, DELETE

const API_URL = "https://fast-api-project-2-tfw6.onrender.com";
const USERS_URL = `${API_URL}/users/`;

const form = document.getElementById("user-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const ageInput = document.getElementById("age");
const userList = document.getElementById("user-list");
const message = document.getElementById("message");
const cancelButton = document.getElementById("cancel-button");

let editingId = null;

// Display messages
function showMessage(text, error = false) {
    message.textContent = text;
    message.className = error ? "error" : "success";
}

// API request helper
async function request(url, options = {}) {
    let response;

    try {
        response = await fetch(url, options);
    } catch (error) {
        throw new Error(
            "Backend-এর সঙ্গে সংযোগ হচ্ছে না। FastAPI চালু আছে কি না পরীক্ষা করুন।"
        );
    }

    // DELETE may return HTTP 204 with no response body.
    if (response.status === 204) {
        if (!response.ok) {
            throw new Error(`Request failed (${response.status})`);
        }
        return null;
    }

    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
    }

    if (!response.ok) {
        const detail =
            data && typeof data === "object" ? data.detail : null;

        let errorMessage;

        if (Array.isArray(detail)) {
            errorMessage = detail
                .map(item => item.msg || JSON.stringify(item))
                .join(", ");
        } else if (typeof detail === "string") {
            errorMessage = detail;
        } else if (typeof data === "string" && data) {
            errorMessage = data;
        } else {
            errorMessage = `Request failed (${response.status})`;
        }

        throw new Error(errorMessage);
    }

    return data;
}

// GET: Load all users
async function loadUsers() {
    try {
        const users = await request(USERS_URL);

        userList.replaceChildren();

        if (!Array.isArray(users)) {
            throw new Error("Backend থেকে User List সঠিকভাবে পাওয়া যায়নি।");
        }

        if (users.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 5;
            cell.textContent = "No users found.";
            row.appendChild(cell);
            userList.appendChild(row);
            return;
        }

        for (const user of users) {
            const row = document.createElement("tr");

            for (const value of [
                user.id,
                user.name,
                user.email,
                user.age
            ]) {
                const cell = document.createElement("td");
                cell.textContent = value ?? "";
                row.appendChild(cell);
            }

            const actions = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => editUser(user));

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => deleteUser(user.id));

            actions.append(editButton, deleteButton);
            row.appendChild(actions);
            userList.appendChild(row);
        }
    } catch (error) {
        showMessage("Could not load users: " + error.message, true);
    }
}

// POST: Add user / PUT: Update user
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const user = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        age: Number(ageInput.value)
    };

    if (
        !user.name ||
        !user.email ||
        ageInput.value.trim() === "" ||
        !Number.isInteger(user.age) ||
        user.age < 0 ||
        user.age > 120
    ) {
        showMessage("সঠিক Name, Email এবং Age (0–120) লিখুন।", true);
        return;
    }

    const isEditing = editingId !== null;

    const url = isEditing
        ? `${USERS_URL}${editingId}`
        : USERS_URL;

    try {
        const saveButton = document.getElementById("save-button");
        saveButton.disabled = true;

        await request(url, {
            method: isEditing ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });

        resetForm();
        await loadUsers();

        showMessage(
            isEditing
                ? "User updated successfully."
                : "User added successfully."
        );
    } catch (error) {
        showMessage("Save failed: " + error.message, true);
    } finally {
        document.getElementById("save-button").disabled = false;
    }
});

// Edit user
function editUser(user) {
    editingId = user.id;

    nameInput.value = user.name ?? "";
    emailInput.value = user.email ?? "";
    ageInput.value = user.age ?? "";

    document.getElementById("form-title").textContent = "Edit User";
    document.getElementById("save-button").textContent = "Update User";

    cancelButton.hidden = false;
    nameInput.focus();

    showMessage(`Editing user ID: ${user.id}`);
}

// DELETE user
async function deleteUser(id) {
    if (!confirm("Are you sure you want to delete this user?")) {
        return;
    }

    try {
        await request(`${USERS_URL}${id}`, {
            method: "DELETE"
        });

        if (editingId === id) {
            resetForm();
        }

        await loadUsers();
        showMessage("User deleted successfully.");
    } catch (error) {
        showMessage("Delete failed: " + error.message, true);
    }
}

// Reset form
function resetForm() {
    form.reset();
    editingId = null;

    document.getElementById("form-title").textContent = "Add User";
    document.getElementById("save-button").textContent = "Add User";

    cancelButton.hidden = true;
}

// Cancel editing
cancelButton.addEventListener("click", resetForm);

// Initial load
loadUsers();
```