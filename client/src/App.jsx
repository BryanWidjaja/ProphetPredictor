import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Tutorial from "./pages/Tutorial";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tutorial" element={<Tutorial />} />
    </Routes>
  );
}

export default App;
