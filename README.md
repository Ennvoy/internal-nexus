<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1UuD6_iTEtvBkXoFfRUyagQqdITqNFfbZ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. （如果你需要）在本地開發可把 `.env.local` 加入需要的環境變數；目前專案沒有預設使用 Gemini API，因此無需設定 `GEMINI_API_KEY`。
3. Run the app:
   `npm run dev`

## 部署（GitHub Pages）

- 本專案會部署到：
   https://ennvoy.github.io/internal-nexus/

- 重要設定：Vite 的 `base` 已設定為 `/internal-nexus/`，確保靜態資源與路徑正確。

- 部署流程（使用 GitHub Actions 自動部署）：
  1. 到 GitHub 專案的 `Settings` → `Pages`，確認 Source 選擇 `GitHub Actions`（或保持預設）。
  2. （若未來需要 API 金鑰）到 `Settings` → `Secrets and variables` → `Actions`，新增對應的 Repository secret；目前不需設定 `GEMINI_API_KEY`。
  3. 每次 push 到 `main` 分支，位於 `.github/workflows/deploy.yml` 的 workflow 會自動執行：
     - 安裝依賴（`npm ci`）
     - 執行 `npm run build`
     - 將 `dist` 資料夾上傳並透過 GitHub Pages 部署

- 備註：目前專案預設沒有使用 Gemini API（若日後需要再加入），若未來必須使用第三方私密金鑰，建議以後端 proxy 或 serverless function 處理，以避免在客戶端暴露敏感金鑰。
