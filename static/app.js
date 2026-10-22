// Beginner-friendly CRUD: Add (POST), Edit (PUT), Delete (DELETE).
// No PATCH endpoint or separate age update button.
const api = "/users/";
const form = document.getElementById("user-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const ageInput = document.getElementById("age");
const userList = document.getElementById("user-list");
const message = document.getElementById("message");
const cancelButton = document.getElementById("cancel-button");
let editingId = null;

function showMessage(text, error = false) {
    message.textContent = text;
    message.className = error ? "error" : "";
}

async function request(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
        const detail = data.detail;
        throw new Error(typeof detail === "string" ? detail : `Request failed (${response.status})`);
    }
    return data;
}

// GET and display all users.
async function loadUsers() {
    try {
        const users = await request(api);
        userList.replaceChildren();
        for (const user of users) {
            const row = document.createElement("tr");
            for (const value of [user.id, user.name, user.email, user.age]) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            }
            const actions = document.createElement("td");
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.onclick = () => editUser(user);
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.onclick = () => deleteUser(user.id);
            actions.append(editButton, deleteButton);
            row.appendChild(actions);
            userList.appendChild(row);
        }
        if (users.length === 0) {
            userList.innerHTML = '<tr><td colspan="5">No users found.</td></tr>';
        }
    } catch (error) {
        showMessage("Could not load users: " + error.message, true);
    }
}

// Same form handles POST and PUT, including age.
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const user = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        age: Number(ageInput.value)
    };
    if (!user.name || !user.email || ageInput.value.trim() === "" ||
        !Number.isInteger(user.age) || user.age < 0 || user.age > 120) {
        showMessage("Enter a valid name, email, and age (0 to 120).", true);
        return;
    }
    const isEditing = editingId !== null;
    const url = isEditing ? `${api}${editingId}` : api;
    try {
        await request(url, {
            method: isEditing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        });
        resetForm();
        await loadUsers();
        showMessage(isEditing ? "User updated successfully." : "User added successfully.");
    } catch (error) {
        showMessage(error.message, true);
    }
});

// Edit: load Name, Email, and Age into the form.
function editUser(user) {
    editingId = user.id;
    nameInput.value = user.name;
    emailInput.value = user.email;
    ageInput.value = user.age;
    document.getElementById("form-title").textContent = "Edit User";
    document.getElementById("save-button").textContent = "Update User";
    cancelButton.hidden = false;
    nameInput.focus();
}

// DELETE a user after confirmation.
async function deleteUser(id) {
    if (!confirm("Delete this user?")) return;
    try {
        await request(`${api}${id}`, { method: "DELETE" });
        if (editingId === id) resetForm();
        await loadUsers();
        showMessage("User deleted successfully.");
    } catch (error) {
        showMessage(error.message, true);
    }
}

function resetForm() {
    form.reset();
    editingId = null;
    document.getElementById("form-title").textContent = "Add User";
    document.getElementById("save-button").textContent = "Add User";
    cancelButton.hidden = true;
}

cancelButton.addEventListener("click", resetForm);
loadUsers();
