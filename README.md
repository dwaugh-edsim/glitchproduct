# 🚀 GlitchProduct Marking Bot

Welcome to your repurposed and upgraded Marking Tool! This version is built with **Next.js** to support secure **Git Secrets**.

## 🛡️ Secure Setup (GitHub Secrets)

To make the AI work, you need to add your API keys to your GitHub repository:

1.  Go to your repository on GitHub: `https://github.com/icumusicvideo-crypto/glitchproduct`
2.  Click **Settings** > **Secrets and variables** > **Actions**.
3.  Click **New repository secret** for each of these:
    *   `OPENROUTER_API_KEY`
    *   `ZAI_API_KEY` (Zhipu AI / GLM)
    *   `MINIMAX_API_KEY` (MiniMax)

## 🌐 Deploying to the Web

Since this is a Next.js app, the easiest way to host it is on **Vercel** (the creators of Next.js):

1.  Go to [Vercel.com](https://vercel.com) and sign in with GitHub.
2.  Click **Add New** > **Project**.
3.  Select your `glitchproduct` repository.
4.  Vercel will automatically detect the settings. **Make sure to add your Environment Variables (the same keys as above) during the import process.**
5.  Click **Deploy**!

## 💻 Local Development

If you want to run it on your own computer:

1.  Open your terminal in this folder.
2.  Run `npm install` to install dependencies.
3.  Run `npm run dev` to start the local server.
4.  Open `http://localhost:3000` in your browser.

## ✨ Features
*   **Multi-Model Moderation**: Uses two teachers and one moderator for high-accuracy marking.
*   **Secure API Keys**: Keys are hidden on the server and never exposed to users.
*   **Premium Design**: Built with Tailwind CSS and glassmorphism.
*   **File Support**: Handles .docx, .pdf, and spreadsheets.
