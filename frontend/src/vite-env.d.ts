/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** Base URL of the chatbot service (e.g. https://chatbot.example.com), no path suffix */
  readonly VITE_CHATBOT_API_URL?: string;
}
