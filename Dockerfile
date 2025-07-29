# Node.jsの公式LTS (長期サポート) バージョンをベースイメージとして使用
# slimバージョンは軽量で本番環境に適しています
FROM node:20-slim

# アプリケーションの作業ディレクトリをコンテナ内に設定
# 今後の全てのコマンドはこのディレクトリで実行されます
WORKDIR /app

# backendディレクトリ内のpackage.jsonとpackage-lock.jsonを先にコピーし、依存関係をインストール
# これにより、アプリケーションのソースコードが変更されても、依存関係が変わらない限りnpm installが再実行されず、
# ビルド時間が短縮されます (Dockerのキャッシュレイヤーを活用)
COPY backend/package.json ./backend/
COPY backend/package-lock.json ./backend/
RUN npm install --prefix ./backend

# プロジェクトの全てのファイルをコンテナの作業ディレクトリにコピー
# .gitignoreで指定されたファイルはコピーされません
COPY . .

# Cloud Runがコンテナからのトラフィックをルーティングするポートを公開
# Cloud Runは PORT 環境変数を設定するため、アプリケーションはこの変数からポートを読み取る必要があります。
# server.jsはすでに process.env.PORT || 3000 を使っているので問題ありません。
EXPOSE 8080

# アプリケーションを起動するコマンド
# コンテナが起動したときに実行されるメインプロセスを定義します
CMD ["node", "backend/server.js"]