// --- Configuration: UK Bank Holidays ---
const ukBankHolidays = new Set([
    "2023-01-02", "2023-04-07", "2023-04-10", "2023-05-01", "2023-05-08", "2023-05-29", "2023-08-28", "2023-12-25", "2023-12-26",
    "2024-01-01", "2024-03-29", "2024-04-01", "2024-05-06", "2024-05-27", "2024-08-26", "2024-12-25", "2024-12-26",
    "2025-01-01", "2025-04-18", "2025-04-21", "2025-05-05", "2025-05-26", "2025-08-25", "2025-12-25", "2025-12-26",
    "2026-01-01", "2026-04-03", "2026-04-06", "2026-05-04", "2026-05-25", "2026-08-31", "2026-12-25", "2026-12-28",
    "2027-01-01", "2027-03-26", "2027-03-29", "2027-05-03", "2027-05-31", "2027-08-30", "2027-12-27", "2027-12-28",
    "2028-01-03", "2028-04-14", "2028-04-17", "2028-05-01", "2028-05-29", "2028-08-28", "2028-12-25", "2028-12-26"
]);

// --- DOM Elements ---
const invoiceDateInput = document.getElementById('invoiceDate');
const paymentTermsInput = document.getElementById('paymentTerms');
const calculateBtn = document.getElementById('calculateBtn');
const resultText = document.getElementById('resultText');
const copyBtn = document.getElementById('copyBtn');
const toggleSwitch = document.getElementById('calculationTypeToggle');
const toggleLabel = document.getElementById('toggleLabel');

// --- Event Listeners ---
calculateBtn.addEventListener('click', calculateDueDate);

[invoiceDateInput, paymentTermsInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculateDueDate();
    });
});

// Copy to Clipboard
copyBtn.addEventListener('click', () => {
    const textToCopy = resultText.textContent;
    
    // Prevent copying placeholder or error text if desired, or just copy whatever is there.
    if (!textToCopy || textToCopy === "Due Date:") return;

    navigator.clipboard.writeText(textToCopy).then(() => {
        // Optional: Visual feedback
        const originalIcon = copyBtn.innerHTML;
        // Switch to checkmark
        copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalIcon;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
});

// Toggle Switch Listener
toggleSwitch.addEventListener('change', updateToggleLabel);

function updateToggleLabel() {
    if (toggleSwitch.checked) {
        toggleLabel.innerHTML = 'Calculate Using: <strong>Business Days</strong>';
    } else {
        toggleLabel.innerHTML = 'Calculate Using: <strong>Calendar Days</strong>';
    }
}

// --- Helper Functions ---
function getFormattedDateString(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function isBusinessDay(dateObj) {
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;

    const dateString = getFormattedDateString(dateObj);
    if (ukBankHolidays.has(dateString)) return false;

    return true;
}

// --- Main Calculation ---
function calculateDueDate() {
    const invoiceDateStr = invoiceDateInput.value;
    let daysToAdd = parseInt(paymentTermsInput.value, 10);
    const useBusinessDays = toggleSwitch.checked;

    // Reset styles
    resultText.classList.remove('error-text', 'placeholder-text');

    if (!invoiceDateStr) {
        showError('Please select an invoice date.');
        return;
    }

    if (isNaN(daysToAdd) || daysToAdd < 0) {
        showError('Please enter valid payment terms.');
        return;
    }

    try {
        const currentDate = new Date(invoiceDateStr + 'T00:00:00');

        if (useBusinessDays) {
            while (daysToAdd > 0) {
                currentDate.setDate(currentDate.getDate() + 1);
                if (isBusinessDay(currentDate)) {
                    daysToAdd--;
                }
            }
        } else {
            currentDate.setDate(currentDate.getDate() + daysToAdd);
        }

        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        resultText.textContent = `${currentDate.toLocaleDateString('en-GB', options)}`;
        
    } catch (error) {
        console.error(error);
        showError('An error occurred during calculation.');
    }
}

function showError(msg) {
    resultText.textContent = msg;
    resultText.classList.add('error-text');
}