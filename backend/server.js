require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQLデータベース接続プール
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// ミドルウェア
app.use(express.json());
app.use(cors());

// --- 静的ファイルの配信設定 (ここはそのままでOK) ---
// frontendディレクトリを静的ファイルとして公開
app.use(express.static(path.join(__dirname, '../frontend')));

// --- APIエンドポイント (ここから) ---
// 1. 全ての支出を取得
app.get('/api/expenses', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM expenses ORDER BY transaction_date DESC, id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching expenses' });
    }
});

// 2. 支出を新規追加
app.post('/api/expenses', async (req, res) => {
    const { amount, category, description, transaction_date } = req.body;
    if (!amount || !category || !transaction_date) {
        return res.status(400).json({ error: 'Amount, category, and date are required' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO expenses (amount, category, description, transaction_date) VALUES ($1, $2, $3, $4) RETURNING *',
            [amount, category, description, transaction_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error adding expense' });
    }
});

// 3. 支出を更新
app.put('/api/expenses/:id', async (req, res) => {
    const { id } = req.params;
    const { amount, category, description, transaction_date } = req.body;
    try {
        const result = await pool.query(
            'UPDATE expenses SET amount = $1, category = $2, description = $3, transaction_date = $4 WHERE id = $5 RETURNING *',
            [amount, category, description, transaction_date, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating expense' });
    }
});

// 4. 支出を削除
app.delete('/api/expenses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.status(204).send(); // No Content
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error deleting expense' });
    }
});

// 5. カテゴリ別集計を取得 (期間指定可能)
app.get('/api/expenses/summary', async (req, res) => {
    const { startDate, endDate } = req.query; // クエリパラメータから期間を取得

    let query = `
        SELECT category, SUM(amount) AS total_amount
        FROM expenses
    `;
    const queryParams = [];
    const conditions = [];

    if (startDate) {
        conditions.push(`transaction_date >= $${conditions.length + 1}`);
        queryParams.push(startDate);
    }
    if (endDate) {
        conditions.push(`transaction_date <= $${conditions.length + 1}`);
        queryParams.push(endDate);
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` GROUP BY category ORDER BY total_amount DESC`;

    try {
        const result = await pool.query(query, queryParams);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching summary' });
    }
});

// 6. カテゴリの一覧を取得
app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT name FROM categories ORDER BY name');
        res.json(result.rows.map(row => row.name)); // 名前だけを返す
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching categories' });
    }
});
// --- APIエンドポイント (ここまで) ---


// --- SPAのためのフォールバックルート (ここを一番最後に移動) ---
// 上記の静的ファイルとAPIルートにマッチしない全てのGETリクエストに対して index.html を返す
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// サーバー起動
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log('Access http://localhost:3000 in your browser to see the frontend.');
});