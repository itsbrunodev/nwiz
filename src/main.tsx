import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

import { IndexPage } from "./app";
import { RootLayout } from "./app/layout";
import { SavedPage } from "./app/saved";

import "./fonts.css";
import "./index.css";

// biome-ignore lint/style/noNonNullAssertion: simple fix
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<IndexPage />} />
          <Route path="saved" element={<SavedPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
