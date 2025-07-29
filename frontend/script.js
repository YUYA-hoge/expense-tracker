// --- PapaParse Script Loader ---
// Load PapaParse library for CSV parsing
const papaParseScript = document.createElement('script');
papaParseScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js';
document.head.appendChild(papaParseScript);


const API_URL = 'http://localhost:3000/api';

// --- DOM Elements ---
const expenseForm = document.getElementById('expense-form');
const dateInput = document.getElementById('date');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const descriptionInput = document.getElementById('description');
const expenseList = document.getElementById('expense-list');
const summaryList = document.getElementById('summary-list');
const summaryStartDateInput = document.getElementById('summary-start-date');
const summaryEndDateInput = document.getElementById('summary-end-date');
const applyFilterButton = document.getElementById('apply-filter');

// Edit Modal Elements
const editModalElement = document.getElementById('edit-modal');
const editModal = new bootstrap.Modal(editModalElement);
const editForm = document.getElementById('edit-form');
const editIdInput = document.getElementById('edit-id');
const editDateInput = document.getElementById('edit-date');
const editAmountInput = document.getElementById('edit-amount');
const editCategorySelect = document.getElementById('edit-category');
const editDescriptionInput = document.getElementById('edit-description');
const saveEditButton = document.getElementById('save-edit-btn');

// CSV Import Elements
const csvDropZone = document.getElementById('csv-drop-zone');
const csvFileInput = document.getElementById('csv-file-input');
const csvPreviewModalElement = document.getElementById('csv-preview-modal');
const csvPreviewModal = new bootstrap.Modal(csvPreviewModalElement);
const csvPreviewList = document.getElementById('csv-preview-list');
const importCsvButton = document.getElementById('import-csv-btn');
const selectAllRowsCheckbox = document.getElementById('select-all-rows');


let expenseChart; // Chart.js instance
let availableCategories = []; // To store categories for reuse

// --- Utility Functions ---
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const userOffset = date.getTimezoneOffset() * 60000;
    const jstDate = new Date(date.getTime() - userOffset);
    return jstDate.toISOString().split('T')[0];
};

// --- API Functions ---
async function fetchCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('カテゴリの取得エラー:', error);
        return [];
    }
}

async function fetchExpenses() {
    try {
        const response = await fetch(`${API_URL}/expenses`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('支出一覧の取得エラー:', error);
        return [];
    }
}

async function fetchSummary(startDate, endDate) {
    try {
        const response = await fetch(`${API_URL}/expenses/summary?startDate=${startDate}&endDate=${endDate}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('カテゴリ別集計の取得エラー:', error);
        return [];
    }
}

// --- UI Update Functions ---
function populateCategorySelect(selectElement, categories) {
    selectElement.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        selectElement.appendChild(option);
    });
}

function renderExpenses(expenses) {
    expenseList.innerHTML = '';
    if (expenses.length === 0) {
        expenseList.innerHTML = '<tr><td colspan="5" class="text-center text-muted">支出データがありません。</td></tr>';
        return;
    }
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.dataset.id = expense.id;
        row.innerHTML = `
            <td>${formatDate(expense.transaction_date)}</td>
            <td>¥${expense.amount.toLocaleString()}</td>
            <td><span class="badge bg-secondary">${expense.category}</span></td>
            <td>${expense.description || ''}</td>
            <td class="text-end action-buttons">
                <button class="btn btn-sm btn-outline-primary edit-btn">
                    <i class="material-icons">edit</i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-btn">
                    <i class="material-icons">delete</i>
                </button>
            </td>
        `;
        expenseList.appendChild(row);
    });
}

function renderSummaryAndChart(summary) {
    summaryList.innerHTML = '';
    const labels = [];
    const data = [];
    const backgroundColors = [
        '#42a5f5', '#66bb6a', '#ffa726', '#ef5350', '#ab47bc',
        '#26a69a', '#78909c', '#ff7043', '#8d6e63', '#ec407a'
    ];

    if (summary.length === 0) {
        summaryList.innerHTML = '<li class="list-group-item text-muted">集計データがありません。</li>';
    } else {
        summary.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.innerHTML = `
                ${item.category}
                <span class="badge bg-primary rounded-pill">¥${parseFloat(item.total_amount).toLocaleString()}</span>
            `;
            summaryList.appendChild(listItem);

            labels.push(item.category);
            data.push(parseFloat(item.total_amount));
        });
    }

    const ctx = document.getElementById('expense-chart').getContext('2d');
    if (expenseChart) {
        expenseChart.destroy();
    }
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: false
                }
            }
        }
    });
}

// --- Main Application Logic ---
async function refreshAllData() {
    const startDate = summaryStartDateInput.value;
    const endDate = summaryEndDateInput.value;

    const [expenses, summary] = await Promise.all([
        fetchExpenses(),
        fetchSummary(startDate, endDate)
    ]);

    renderExpenses(expenses);
    renderSummaryAndChart(summary);
}

async function initializeApp() {
    // Set default dates
    dateInput.value = new Date().toISOString().split('T')[0];
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    summaryStartDateInput.value = firstDayOfMonth.toISOString().split('T')[0];
    summaryEndDateInput.value = today.toISOString().split('T')[0];

    availableCategories = await fetchCategories();
    populateCategorySelect(categorySelect, availableCategories);
    populateCategorySelect(editCategorySelect, availableCategories);

    await refreshAllData();
}

// --- Event Listeners ---
expenseForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const expenseData = {
        transaction_date: dateInput.value,
        amount: parseFloat(amountInput.value),
        category: categorySelect.value,
        description: descriptionInput.value
    };

    try {
        const response = await fetch(`${API_URL}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expenseData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'サーバーエラー');
        }
        expenseForm.reset();
        dateInput.value = new Date().toISOString().split('T')[0];
        await refreshAllData();
    } catch (error) {
        console.error('支出の記録エラー:', error);
        alert(`支出の記録に失敗しました: ${error.message}`);
    }
});

expenseList.addEventListener('click', async (event) => {
    const target = event.target.closest('button');
    if (!target) return;

    const row = target.closest('tr');
    const id = row.dataset.id;

    if (target.classList.contains('delete-btn')) {
        if (confirm('本当にこの支出を削除しますか？')) {
            try {
                const response = await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('削除に失敗しました');
                await refreshAllData();
            } catch (error) {
                console.error('支出の削除エラー:', error);
                alert('支出の削除に失敗しました。');
            }
        }
    } else if (target.classList.contains('edit-btn')) {
        const cells = row.children;
        editIdInput.value = id;
        editDateInput.value = cells[0].textContent;
        editAmountInput.value = parseFloat(cells[1].textContent.replace(/[¥,]/g, ''));
        editCategorySelect.value = cells[2].querySelector('.badge').textContent;
        editDescriptionInput.value = cells[3].textContent;
        editModal.show();
    }
});

saveEditButton.addEventListener('click', async () => {
    const id = editIdInput.value;
    const expenseData = {
        transaction_date: editDateInput.value,
        amount: parseFloat(editAmountInput.value),
        category: editCategorySelect.value,
        description: editDescriptionInput.value
    };

    if (!editForm.checkValidity()) {
        editForm.reportValidity();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/expenses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expenseData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'サーバーエラー');
        }
        editModal.hide();
        await refreshAllData();
    } catch (error) {
        console.error('支出の更新エラー:', error);
        alert(`支出の更新に失敗しました: ${error.message}`);
    }
});

applyFilterButton.addEventListener('click', refreshAllData);


// --- CSV Import Logic ---
function handleFile(file) {
    if (!file) {
        alert('ファイルが選択されていません。');
        return;
    }
    // ファイル名でCSVか判定を強化
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
        alert('CSVファイルを選択してください。');
        return;
    }

    Papa.parse(file, {
        encoding: "Shift_JIS", // 文字コードをShift_JISに指定
        complete: (results) => {
            if (results.errors.length > 0) {
                console.error("CSV Parse errors:", results.errors);
            }
            renderCsvPreview(results.data);
            csvPreviewModal.show();
        },
        error: (error) => {
            alert('CSVの解析に失敗しました: ' + error.message);
        }
    });
}

function renderCsvPreview(data) {
    csvPreviewList.innerHTML = '';
    data.forEach((row, index) => {
        if (row.length < 8) return; // Skip malformed rows

        const date = row[0];
        const description = row[1];
        const amount = row[6];

        // Basic validation
        if (!date || !description || !amount || isNaN(parseFloat(amount))) {
            return;
        }

        const tableRow = document.createElement('tr');
        tableRow.innerHTML = `
            <td><input type="checkbox" class="row-checkbox" checked></td>
            <td><input type="date" class="form-control form-control-sm" value="${formatDate(date)}"></td>
            <td><input type="text" class="form-control form-control-sm" value="${description}"></td>
            <td><input type="number" class="form-control form-control-sm" value="${amount}"></td>
            <td>
                <select class="form-select form-select-sm">
                    ${availableCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                </select>
            </td>
        `;
        csvPreviewList.appendChild(tableRow);
    });
    selectAllRowsCheckbox.checked = true;
}

csvDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    csvDropZone.classList.add('dragover');
});

csvDropZone.addEventListener('dragleave', () => {
    csvDropZone.classList.remove('dragover');
});

csvDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    csvDropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    handleFile(file);
});

csvFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFile(file);
});

selectAllRowsCheckbox.addEventListener('change', (e) => {
    const checkboxes = csvPreviewList.querySelectorAll('.row-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
    });
});

importCsvButton.addEventListener('click', async () => {
    const rowsToImport = [];
    const previewRows = csvPreviewList.querySelectorAll('tr');

    previewRows.forEach(row => {
        const checkbox = row.querySelector('.row-checkbox');
        if (checkbox.checked) {
            const inputs = row.querySelectorAll('input, select');
            rowsToImport.push({
                transaction_date: inputs[1].value,
                description: inputs[2].value,
                amount: parseFloat(inputs[3].value),
                category: inputs[4].value,
            });
        }
    });

    if (rowsToImport.length === 0) {
        alert('インポートするデータが選択されていません。');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/expenses/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rowsToImport),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '一括登録に失敗しました');
        }

        csvPreviewModal.hide();
        await refreshAllData();
        alert(`${rowsToImport.length}件の支出をインポートしました。`);

    } catch (error) {
        console.error('CSVインポートエラー:', error);
        alert(`インポートに失敗しました: ${error.message}`);
    }
});


// --- Initial Load ---
papaParseScript.onload = () => {
    document.addEventListener('DOMContentLoaded', initializeApp);
};
