import { Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout.jsx";
import { ComparacaoMoedas } from "./pages/ComparacaoMoedas.jsx";
import { JuroRealXCambio } from "./pages/JuroRealXCambio.jsx";
import { Metodologia } from "./pages/Metodologia.jsx";
import { VisaoGeral } from "./pages/VisaoGeral.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<VisaoGeral />} />
        <Route path="comparacao-moedas" element={<ComparacaoMoedas />} />
        <Route path="juro-real-x-cambio" element={<JuroRealXCambio />} />
        <Route path="metodologia" element={<Metodologia />} />
      </Route>
    </Routes>
  );
}
