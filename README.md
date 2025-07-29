# 個人用支出トラッカー

このプロジェクトは、Node.js (Express.js) と PostgreSQL をバックエンドに、Bootstrap 5 を利用したモダンなUIを持つ個人用支出トラッカーです。支出の記録、一覧表示、カテゴリ別集計、およびグラフ表示が可能です。

## スクリーンショット

![アプリケーションのスクリーンショット](https://user-images.githubusercontent.com/xxxxxxxx/xxxxxxxxx.png) <!-- TODO: スクリーンショットのURLを後で挿入 -->

## 目次

1.  [機能](#機能)
2.  [技術スタック](#技術スタック)
3.  [プロジェクトのセットアップ（ローカル）](#プロジェクトのセットアップローカル)
4.  [GCP環境でのセットアップ](#gcp環境でのセットアップ)
5.  [ディレクトリ構成](#ディレクトリ構成)
6.  [使い方](#使い方)
7.  [今後の改善点](#今後の改善点)

---

## 機能

-   **支出の記録**: 日付、金額、カテゴリ、メモを入力して支出を記録。
-   **支出一覧**: 記録された支出をリアルタイムで一覧表示。各支出の**編集**および**削除**が可能。
-   **カテゴリ別集計**: 指定した期間のカテゴリ別支出合計を**ドーナツグラフ**で可視化。
-   **レスポンシブデザイン**: PC、タブレット、スマートフォンなど、様々なデバイスサイズに対応。
-   **モダンなUI**: Bootstrap 5とMaterial Iconsを採用し、直感的で使いやすいインターフェースを提供。

---

## 技術スタック

-   **バックエンド**:
    -   **Node.js**: サーバーサイド実行環境
    -   **Express.js**: Webアプリケーションフレームワーク
    -   **`pg`**: PostgreSQLクライアント
    -   **`dotenv`**: 環境変数管理
    -   **`cors`**: クロスオリジンリソース共有対応
-   **データベース**:
    -   **PostgreSQL**: リレーショナルデータベース
-   **フロントエンド**:
    -   **HTML5 / CSS3**: 基本的な構造とスタイル
    -   **Vanilla JavaScript**: クライアントサイドロジック (ES6+ Modules)
    -   **Bootstrap 5**: UIフレームワーク
    -   **Chart.js**: グラフ描画ライブラリ
    -   **Material Icons**: アイコンフォント
-   **クラウド環境 (GCP)**:
    -   **Cloud Run**: コンテナ実行環境
    -   **Cloud SQL for PostgreSQL**: マネージドデータベース
    -   **Artifact Registry**: コンテナイメージ管理
    -   **Cloud Build**: CI/CD、ビルド自動化

---

## プロジェクトのセットアップ（ローカル）

### 前提条件

-   Node.js (v14以上推奨) および npm
-   PostgreSQL

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

2.  `expense_tracker`データベース内に必要なテーブルを作成します。`backend/init.sql` を利用できます。

    ```bash
    psql -U expense_user -d expense_tracker -f backend/init.sql
    ```

### バックエンドのセットアップ

1.  プロジェクトのルートディレクトリで、`backend`ディレクトリに移動します。

    ```bash
    cd backend
    ```

2.  必要なNode.jsパッケージをインストールします。

    ```bash
    npm install
    ```

3.  `.env`ファイルを作成し、データベース接続情報を設定します。

    ```
    DB_USER=expense_user
    DB_PASSWORD=your_password
    DB_HOST=localhost
    DB_PORT=5432
    DB_DATABASE=expense_tracker
    PORT=3000
    ```

### アプリケーションの実行

1.  `backend`ディレクトリで、Node.jsサーバーを起動します。

    ```bash
    npm start
    ```
    または、開発モードで起動する場合：
    ```bash
    npm run dev
    ```

2.  ウェブブラウザで `frontend/index.html` ファイルを開きます。
    （または、Live ServerのようなVSCode拡張機能で開くと便利です）

---

## GCP環境でのセットアップ

（このセクションは変更ありません）

---

## ディレクトリ構成

```
expense-tracker/
├── backend/
│   ├── .env                # 環境変数ファイル
│   ├── init.sql            # DB初期化用SQL
│   ├── package.json        # プロジェクト設定
│   └── server.js           # Express.jsサーバーのメインファイル
├── frontend/
│   ├── index.html          # フロントエンドのHTML
│   ├── style.css           # カスタムCSS
│   └── script.js           # フロントエンドのJavaScript
├── .gitignore
├── Dockerfile
└── README.md               # このファイル
```

---

## 使い方

1.  **支出を記録**:
    -   画面左側のフォームに「日付」「金額」「カテゴリ」「メモ」を入力し、「記録する」ボタンをクリックします。
2.  **支出一覧**:
    -   画面右側の表に支出が一覧表示されます。
    -   各行の編集アイコンをクリックするとモーダルウィンドウが開き、内容を更新できます。
    -   削除アイコンをクリックすると、確認ダイアログの後に項目が削除されます。
3.  **カテゴリ別集計**:
    -   画面左下のカードで集計期間（開始日・終了日）を設定し、「絞り込む」ボタンをクリックします。
    -   指定期間内のカテゴリ別合計金額がリストとドーナツグラフで表示されます。

---

## 今後の改善点

-   ユーザー認証・管理機能の追加
-   支出カテゴリの動的な管理（追加・編集・削除）
-   より詳細なレポート機能（月別、年別など）
-   React, Vue.jsなどのモダンなフロントエンドフレームワークの導入
-   テストコードの追加（Jest, Cypressなど）
-   入力バリデーションの強化

このプロジェクトは、Node.jsとPostgreSQLを使ったWebアプリケーション開発の基礎を学ぶための良いスタート地点となるでしょう。ぜひ自由に拡張してみてください！
