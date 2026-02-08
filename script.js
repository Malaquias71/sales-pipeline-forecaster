 /* ================================
   1️⃣ DOM REFERENCES (Grab the HTML)
 ================================ */

const form = document.getElementById("dealForm");
const nameInput = document.getElementById("dealName");
const valueInput = document.getElementById("dealValue");
const probabilityInput = document.getElementById("dealProbability");
const tableBody = document.getElementById("dealTableBody");
const totalPipelineEl = document.getElementById("totalPipeline");
const totalExpectedEl = document.getElementById("totalExpected");
const dealCountEl = document.getElementById("dealCount");
const sortBtn = document.getElementById("sortExpected");
const submitBtn = form.querySelector("button");

/* ================================
   2️⃣ APPLICATION STATE (Memory)
================================ */


// This is our in-memory database.
// Think of this as the brain of our app.
// This array is our "database in RAM"



let deals =  JSON.parse(localStorage.getItem("deals")) || [];

// Tracks whether we are editing an existing deal
let editIndex = null;


/* ================================
   3️⃣ INITIAL RENDER
================================ */

document.addEventListener("DOMContentLoaded", renderDeals);

/* ================================
   UTILITY: Currency Formatter
================================ */

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(amount);
}


/* ================================
   4️⃣ RENDER FUNCTION
================================ */

function renderDeals() {
    tableBody.innerHTML = "";

    if (deals.length === 0) {
        renderEmptyState();
        updateMetrics();
        return;
    }

    deals.forEach((deal, index) => {
        const expected = deal.value * (deal.probability / 100);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${deal.name}</td>
            <td>${formatCurrency(deal.value)}</td>
            <td>${deal.probability}%</td>
            <td>${formatCurrency(expected)}</td>
            <td>
                <button class="edit-btn" data-index="${index}">
                    Edit
                </button>
                <button class="delete-btn" data-index="${index}">
                    Delete
                </button>
            </td>
            
            `;

                tableBody.appendChild(row);
    
    });

    updateMetrics();
}


/* ================================
   EMPTY STATE
================================ */

function renderEmptyState() {
    tableBody.innerHTML = `
        <tr>
            <td colspan="5" class="empty-state">
                No deals added yet.
            </td>
       </tr>
    `;
}

/* ================================
   METRICS
================================ */

function updateMetrics() {
    const totals = deals.reduce(
        (acc, deal) => {
            acc.pipeline += deal.value;
            acc.expected += deal.value * (deal.probability / 100);
            return acc;

        },
        { pipeline: 0, expected: 0}
    );

    totalPipelineEl.textContent = formatCurrency(totals.pipeline);
    totalExpectedEl.textContent = formatCurrency(totals.expected);
    dealCountEl.textContent = deals.length;
}

/* ================================
   STORAGE
================================ */

function saveToStorage() {
    localStorage.setItem("deals", JSON.stringify(deals));

}


/* ================================
   DELETE
================================ */

function deleteDeal(index) {
    if (!confirm("Are you sure you want to delete this deal?")) return;

    deals.splice(index, 1);
    saveToStorage();
    renderDeals();

}



/* ================================
   EDIT
================================ */

function startEdit(index) {
    const deal = deals[index];

    nameInput.value = deal.name;
    valueInput.value = deal.value;
    probabilityInput.value = deal.probability;

    editIndex = index;

    submitBtn.textContent ="Update Deal";
}

/* ================================
   EVENT DELEGATION
================================ */

tableBody.addEventListener("click", (e) => {
    const index = Number(e.target.dataset.index);

    if (e.target.classList.contains("delete-btn")) {
        deleteDeal(index);
    }

    if (e.target.classList.contains("edit-btn")) {
        startEdit(index);
    }
});


/* ================================
   SORT
================================ */

sortBtn.addEventListener("click", () => {
    deals.sort((a, b) => {
        const expectedA = a.value * (a.probability / 100);
        const expectedB = b.value * (b.probability / 100);
        return expectedB - expectedA;
    });

    renderDeals();
});


/* ================================
   FORM SUBMIT
================================ */

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const value = Number(valueInput.value);
    const probability = Number(probabilityInput.value);

    if (!name || isNaN(value) || isNaN(probability)) {
        alert("Please enter valid data.");
        return;
    }

    const newDeal = {name, value, probability};

    if (editIndex !== null) {
        deals[editIndex] = newDeal;
        editIndex = null;
        submitBtn.textContent = "Add Deal";
    } else {
        deals.push(newDeal);
    }

    saveToStorage();
    renderDeals();
    form.reset();
});


