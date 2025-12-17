import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Tutorial from "./pages/Tutorial";
import Result from "./pages/Result";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tutorial" element={<Tutorial />} />
      <Route path="/result" element={<Result />} />
    </Routes>
  );
}

export default App;
