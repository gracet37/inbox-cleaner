import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import CleanPage from "./pages/CleanPage";
import HomePage from "./pages/HomePage";
import InboxPage from "./pages/InboxPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/clean" element={<CleanPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
