
let queueState = [
    { id: 1, adopterName: "Sarah Jenkins", petName: "Barnaby (Dog)", email: "sarah.j@example.com", timestamp: "2026-06-06 10:15" },
    { id: 2, adopterName: "Marcus Vance", petName: "Luna (Cat)", email: "m.vance@example.com", timestamp: "2026-06-06 11:00" }
];

let searchTerm = "";


const queueContainer = document.getElementById("queueContainer");
const searchInput = document.getElementById("searchInput");
const loadingIndicator = document.getElementById("loadingIndicator");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const adopterModal = document.getElementById("adopterModal");
const adopterForm = document.getElementById("adopterForm");


const nameInput = document.getElementById("adopterName");
const petInput = document.getElementById("petName");
const emailInput = document.getElementById("contactEmail");


const nameError = document.getElementById("nameError");
const petError = document.getElementById("petError");
const emailError = document.getElementById("emailError");

function sanitizeInput(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}


function logTelemetry(actionDescription) {
    console.log(`[Analytics] User interacted with Adoption Interest Queue: ${actionDescription}`);
}


async function simulateNetworkOperation(callback) {
    loadingIndicator.classList.remove("hidden");
    // Simulating slow 3G network latency delay (e.g., 600ms)
    await new Promise(resolve => setTimeout(resolve, 600));
    loadingIndicator.classList.add("hidden");
    callback();
}


function renderQueue() {
    simulateNetworkOperation(() => {
        const filteredData = queueState.filter(item => 
            item.adopterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.petName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        queueContainer.innerHTML = "";

        if (filteredData.length === 0) {
            queueContainer.innerHTML = `
                <div class="empty-state">
                    <p>No data found matching your query.</p>
                </div>
            `;
            return;
        }

        filteredData.forEach(item => {
            const card = document.createElement("div");
            card.className = "queue-card";
            card.setAttribute("tabindex", "0");
            card.innerHTML = `
                <div class="queue-card-info">
                    <h3>${item.adopterName}</h3>
                    <p>Interested in: <strong>${item.petName}</strong> | Contact: ${item.email}</p>
                </div>
                <div class="queue-card-meta">
                    <small>${item.timestamp}</small>
                </div>
            `;
            queueContainer.appendChild(card);
        });
    });
}

function toggleModal(open) {
    if (open) {
        adopterModal.classList.remove("hidden");
        openModalBtn.setAttribute("aria-expanded", "true");
        nameInput.focus();
        logTelemetry("Opened Add Entry Modal");
    } else {
        adopterModal.classList.add("hidden");
        openModalBtn.setAttribute("aria-expanded", "false");
        adopterForm.reset();
        clearValidationErrors();
        openModalBtn.focus();
    }
}

function clearValidationErrors() {
    [nameInput, petInput, emailInput].forEach(input => input.classList.remove("input-error"));
    [nameError, petError, emailError].forEach(err => err.classList.add("hidden"));
}


searchInput.addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderQueue();
});

openModalBtn.addEventListener("click", () => toggleModal(true));
closeModalBtn.addEventListener("click", () => toggleModal(false));
cancelBtn.addEventListener("click", () => toggleModal(false));


adopterModal.addEventListener("click", (e) => {
    if (e.target === adopterModal) toggleModal(false);
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !adopterModal.classList.contains("hidden")) {
        toggleModal(false);
    }
});


adopterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearValidationErrors();

    let isValid = true;
    const cleanName = sanitizeInput(nameInput.value.trim());
    const cleanPet = sanitizeInput(petInput.value.trim());
    const cleanEmail = sanitizeInput(emailInput.value.trim());

    if (!cleanName) {
        nameInput.classList.add("input-error");
        nameError.classList.remove("hidden");
        isValid = false;
    }

    if (!cleanPet) {
        petInput.classList.add("input-error");
        petError.classList.remove("hidden");
        isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        emailInput.classList.add("input-error");
        emailError.classList.remove("hidden");
        isValid = false;
    }

    if (!isValid) return;


    const newEntry = {
        id: Date.now(),
        adopterName: cleanName,
        petName: cleanPet,
        email: cleanEmail,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    queueState.unshift(newEntry);
    logTelemetry("Successfully added new adoption interest entry");
    toggleModal(false);
    renderQueue();
});


renderQueue();