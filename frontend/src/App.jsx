import { Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout.jsx";
import { ComparacaoMoedas } from "./pages/ComparacaoMoedas.jsx";
import { JurosInflacao } from "./pages/JurosInflacao.jsx";
import { Metodologia } from "./pages/Metodologia.jsx";
import { PoderDeCompra } from "./pages/PoderDeCompra.jsx";
import { VisaoGeral } from "./pages/VisaoGeral.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<VisaoGeral />} />
        <Route path="comparacao-moedas" element={<ComparacaoMoedas />} />
        <Route path="juros-e-inflacao" element={<JurosInflacao />} />
        <Route path="poder-de-compra" element={<PoderDeCompra />} />
        <Route path="metodologia" element={<Metodologia />} />
      </Route>
    </Routes>
  );
}
