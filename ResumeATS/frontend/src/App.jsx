import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import JDMatch from "./pages/JDMatch";
import Rewriter from "./pages/Rewriter";
import Converter from "./pages/Converter";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/jd-match" element={<JDMatch />} />
        <Route path="/rewriter" element={<Rewriter />} />
        <Route path="/converter" element={<Converter />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
