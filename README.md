-----

# 個人用支出トラッカー

このプロジェクトは、Node.js (Express.js) と PostgreSQL を使って構築されたシンプルな個人用支出トラッカーです。支出の記録、一覧表示、カテゴリ別集計、およびグラフ表示が可能です。

## 目次

1.  [機能](https://www.google.com/search?q=%23%E6%A9%9F%E8%83%BD)
2.  [技術スタック](https://www.google.com/search?q=%23%E6%8A%80%E8%A1%93%E3%82%B9%E3%82%BF%E3%83%83%E3%82%AF)
3.  [プロジェクトのセットアップ](https://www.google.com/search?q=%23%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%81%AE%E3%82%BB%E3%83%83%E3%83%88%E3%82%A2%E3%83%83%E3%83%97)
      * [前提条件](https://www.google.com/search?q=%23%E5%89%8D%E6%8F%90%E6%9D%A1%E4%BB%B6)
      * [データベースの準備](https://www.google.com/search?q=%23%E3%83%87%E3%83%BC%E3%82%BF%E3%83%99%E3%83%BC%E3%82%B9%E3%81%AE%E6%BA%96%E5%82%99)
      * [バックエンドのセットアップ](https://www.google.com/search?q=%23%E3%83%90%E3%83%83%E3%82%AF%E3%82%A8%E3%83%B3%E3%83%89%E3%81%AE%E3%82%BB%E3%83%83%E3%83%88%E3%82%A2%E3%83%83%E3%83%97)
      * [アプリケーションの実行](https://www.google.com/search?q=%23%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E5%AE%9F%E8%A1%8C)
4.  [ディレクトリ構成](https://www.google.com/search?q=%23%E3%83%87%E3%82%A3%E3%83%AC%E3%82%AF%E3%83%88%E3%83%AA%E6%A7%8B%E6%88%90)
5.  [使い方](https://www.google.com/search?q=%23%E4%BD%BF%E3%81%84%E6%96%B9)
6.  [今後の改善点](https://www.google.com/search?q=%23%E4%BB%8A%E5%BE%8C%E3%81%AE%E6%94%B9%E5%96%84%E7%82%B9)

-----

## 機能

  * **支出の記録**: 日付、金額、カテゴリ、メモ（任意）を入力して支出を記録できます。
  * **支出一覧**: 記録された支出を日付順に一覧で確認できます。各支出の**編集**および**削除**が可能です。
  * **カテゴリ別集計**: 指定した期間のカテゴリ別支出合計を一覧表示し、**円グラフ**で可視化します。
  * **非同期更新**: フロントエンドは非同期通信でバックエンドAPIと連携し、ページのリロードなしで情報を更新します。

-----

## 技術スタック

  * **バックエンド**:
      * **Node.js**: サーバーサイド実行環境
      * **Express.js**: Webアプリケーションフレームワーク
      * **`pg`**: PostgreSQLクライアント
      * **`dotenv`**: 環境変数管理
      * **`cors`**: クロスオリジンリソース共有対応
  * **データベース**:
      * **PostgreSQL**: リレーショナルデータベース
  * **フロントエンド**:
      * **HTML5**: 構造
      * **CSS3**: スタイル
      * **Vanilla JavaScript**: クライアントサイドロジック
      * **Chart.js**: グラフ描画ライブラリ

-----

## プロジェクトのセットアップ

### 前提条件

  * Node.js (v14以上推奨) および npm
  * PostgreSQL

### データベースの準備

1.  PostgreSQLに接続し、新しいユーザーとデータベースを作成します。

    ```sql
    -- PostgreSQLに接続 (ユーザー名は環境による、例: postgres)
    psql -U postgres

    -- データベースユーザーの作成 (パスワードは適宜変更してください)
    CREATE USER expense_user WITH PASSWORD 'your_password';

    -- データベースの作成
    CREATE DATABASE expense_tracker;

    -- 作成したデータベースに権限を付与
    GRANT ALL PRIVILEGES ON DATABASE expense_tracker TO expense_user;

    -- 接続を終了
    \q
    ```

2.  `expense_tracker`データベース内に必要なテーブルを作成します。

    ```sql
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

    -- サンプルのカテゴリを追加 (任意)
    INSERT INTO categories (name) VALUES
    ('食費'), ('交通費'), ('娯楽費'), ('日用品'), ('固定費'), ('その他');
    ```

    これらのSQLコマンドを`init.sql`のようなファイルに保存し、以下のコマンドで実行することもできます。

    ```bash
    psql -U expense_user -d expense_tracker -f path/to/init.sql
    ```

### バックエンドのセットアップ

1.  プロジェクトのルートディレクトリで、`backend`ディレクトリに移動します。

    ```bash
    cd expense-tracker/backend
    ```

2.  必要なNode.jsパッケージをインストールします。

    ```bash
    npm install
    ```

3.  `.env`ファイルを作成し、データベース接続情報を設定します。`backend`ディレクトリ直下に`.env`という名前で作成してください。

    ```
    DB_USER=expense_user
    DB_PASSWORD=your_password
    DB_HOST=localhost
    DB_PORT=5432
    DB_DATABASE=expense_tracker
    PORT=3000
    ```

    `DB_PASSWORD`は、上記でPostgreSQLユーザーを作成した際に設定したパスワードに置き換えてください。

### アプリケーションの実行

1.  `backend`ディレクトリで、Node.jsサーバーを起動します。

    ```bash
    npm run dev
    ```

    サーバーが正常に起動すると、`Server running on http://localhost:3000`というメッセージが表示されます。

2.  ウェブブラウザを開き、`http://localhost:3000` にアクセスします。
    Node.jsサーバーがフロントエンドのファイルも提供するため、これでアプリケーションの画面が表示されます。

-----

## ディレクトリ構成

```
expense-tracker/
├── backend/
│   ├── node_modules/       # Node.jsパッケージ
│   ├── .env                # 環境変数ファイル
│   ├── package.json        # プロジェクト設定
│   ├── package-lock.json
│   └── server.js           # Express.jsサーバーのメインファイル
├── frontend/
│   ├── index.html          # フロントエンドのHTML
│   ├── style.css           # フロントエンドのCSS
│   └── script.js           # フロントエンドのJavaScript
└── README.md               # このファイル
```

-----

## 使い方

1.  **支出を記録**:
      * 画面上部のフォームに「日付」「金額」「カテゴリ」「メモ」を入力し、「記録する」ボタンをクリックします。
      * カテゴリはデータベースに登録された選択肢から選べます。
2.  **支出一覧**:
      * 記録された支出は、下部の表に一覧表示されます。
      * 各行の「編集」ボタンで内容を更新、「削除」ボタンで項目を削除できます。
3.  **カテゴリ別集計**:
      * 「カテゴリ別集計」セクションで、集計したい期間（開始日・終了日）を設定し、「絞り込む」ボタンをクリックします。
      * 指定期間内のカテゴリ別合計金額がリストと円グラフで表示されます。

-----

## 今後の改善点

  * ユーザー認証・管理機能の追加
  * 支出カテゴリの動的な管理（追加・編集・削除）
  * より詳細なレポート機能（月別、年別など）
  * UI/UXの改善（より洗練されたデザイン、モーダルを使った編集フォームなど）
  * エラーハンドリングの強化とユーザーへのフィードバック
  * React, Vue.jsなどのフロントエンドフレームワークの導入

このプロジェクトは、Node.jsとPostgreSQLを使ったWebアプリケーション開発の基礎を学ぶための良いスタート地点となるでしょう。ぜひ自由に拡張してみてください！

-----

ご不明な点や追加したい機能などがあれば、いつでもお気軽にご質問ください。