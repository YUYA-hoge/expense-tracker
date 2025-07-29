-- expenses テーブル
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- categories テーブル (カテゴリを管理する場合)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- サンプルのカテゴリを追加（任意）
INSERT INTO categories (name) VALUES
('食費'), ('交通費'), ('娯楽費'), ('日用品'), ('固定費'), ('その他');