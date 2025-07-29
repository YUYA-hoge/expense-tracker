const API_URL = 'http://localhost:3000/api';

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

let expenseChart; // Chart.jsのインスタンスを保持する変数

// 現在の日付をデフォルトで設定
dateInput.value = new Date().toISOString().split('T')[0];
summaryStartDateInput.value = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
summaryEndDateInput.value = new Date().toISOString().split('T')[0];


// カテゴリをロードしてセレクトボックスに表示
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const categories = await response.json();
        categorySelect.innerHTML = ''; // 既存のオプションをクリア
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('カテゴリの取得エラー:', error);
    }
}


// 支出一覧をロードして表示
async function loadExpenses() {
    try {
        const response = await fetch(`${API_URL}/expenses`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const expenses = await response.json();
        expenseList.innerHTML = ''; // 既存のリストをクリア

        expenses.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${expense.transaction_date}</td>
                <td>¥${expense.amount.toLocaleString()}</td>
                <td>${expense.category}</td>
                <td>${expense.description || ''}</td>
                <td>
                    <button class="edit-btn" data-id="${expense.id}">編集</button>
                    <button class="delete-btn" data-id="${expense.id}">削除</button>
                </td>
            `;
            expenseList.appendChild(row);
        });
    } catch (error) {
        console.error('支出一覧の取得エラー:', error);
    }
}

// カテゴリ別集計とグラフをロードして表示
async function loadSummaryAndChart() {
    const startDate = summaryStartDateInput.value;
    const endDate = summaryEndDateInput.value;
    try {
        const response = await fetch(`${API_URL}/expenses/summary?startDate=${startDate}&endDate=${endDate}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const summary = await response.json();
        summaryList.innerHTML = ''; // 既存のリストをクリア

        const labels = [];
        const data = [];
        const backgroundColors = [];

        summary.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.category}: ¥${parseFloat(item.total_amount).toLocaleString()}`;
            summaryList.appendChild(listItem);

            labels.push(item.category);
            data.push(parseFloat(item.total_amount));
            backgroundColors.push(getRandomColor()); // ランダムな色を生成
        });

        // Chart.jsでグラフを描画
        const ctx = document.getElementById('expense-chart').getContext('2d');
        if (expenseChart) {
            expenseChart.destroy(); // 既存のグラフがあれば破棄
        }
        expenseChart = new Chart(ctx, {
            type: 'pie', // 円グラフ
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
                plugins: {
                    title: {
                        display: true,
                        text: 'カテゴリ別支出 (円グラフ)'
                    }
                }
            }
        });

    } catch (error) {
        console.error('カテゴリ別集計の取得エラー:', error);
    }
}

// ランダムな色を生成するヘルパー関数
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// 支出フォームの送信イベント
expenseForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // デフォルトのフォーム送信を防止

    const expenseData = {
        transaction_date: dateInput.value,
        amount: parseFloat(amountInput.value),
        category: categorySelect.value,
        description: descriptionInput.value
    };

    try {
        const response = await fetch(`${API_URL}/expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(expenseData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
        }

        // 成功したらフォームをリセットし、支出一覧と集計を再読み込み
        expenseForm.reset();
        dateInput.value = new Date().toISOString().split('T')[0]; // 日付を今日に戻す
        await loadExpenses();
        await loadSummaryAndChart();

    } catch (error) {
        console.error('支出の記録エラー:', error);
        alert('支出の記録に失敗しました: ' + error.message);
    }
});

// 支出一覧での編集・削除ボタンのイベント委譲
expenseList.addEventListener('click', async (event) => {
    const target = event.target;
    const id = target.dataset.id;

    if (target.classList.contains('delete-btn')) {
        if (confirm('本当にこの支出を削除しますか？')) {
            try {
                const response = await fetch(`${API_URL}/expenses/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                // 成功したら支出一覧と集計を再読み込み
                await loadExpenses();
                await loadSummaryAndChart();
            } catch (error) {
                console.error('支出の削除エラー:', error);
                alert('支出の削除に失敗しました。');
            }
        }
    } else if (target.classList.contains('edit-btn')) {
        // 簡易的な編集機能: プロンプトで入力させる
        const currentRow = target.closest('tr');
        const currentAmount = parseFloat(currentRow.children[1].textContent.replace('¥', '').replace(/,/g, ''));
        const currentCategory = currentRow.children[2].textContent;
        const currentDescription = currentRow.children[3].textContent;
        const currentDate = currentRow.children[0].textContent;

        const newDate = prompt('新しい日付:', currentDate);
        if (!newDate) return;

        const newAmountStr = prompt('新しい金額:', currentAmount);
        if (!newAmountStr) return;
        const newAmount = parseFloat(newAmountStr);
        if (isNaN(newAmount) || newAmount < 0) {
            alert('有効な金額を入力してください。');
            return;
        }

        const newCategory = prompt('新しいカテゴリ:', currentCategory);
        if (!newCategory) return;

        const newDescription = prompt('新しいメモ (任意):', currentDescription);

        try {
            const response = await fetch(`${API_URL}/expenses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transaction_date: newDate,
                    amount: newAmount,
                    category: newCategory,
                    description: newDescription
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
            }
            // 成功したら支出一覧と集計を再読み込み
            await loadExpenses();
            await loadSummaryAndChart();
        } catch (error) {
            console.error('支出の更新エラー:', error);
            alert('支出の更新に失敗しました: ' + error.message);
        }
    }
});

// 集計フィルターボタンのイベント
applyFilterButton.addEventListener('click', loadSummaryAndChart);

// ページロード時にデータとカテゴリを読み込み
document.addEventListener('DOMContentLoaded', async () => {
    await loadCategories(); // カテゴリを先に読み込む
    await loadExpenses();
    await loadSummaryAndChart();
});