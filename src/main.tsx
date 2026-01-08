import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY;
if (window.Kakao && kakaoKey && !window.Kakao.isInitialized()) {
  window.Kakao.init(kakaoKey);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  </StrictMode>,
)
