import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App"; // GÜNLÜK ARAÇ TEDARİK
import AracTedarikAnaliz from "./AracTedarikAnaliz";
// Eksik olan bu 👇
import ZamanindaTedarikAnalizi from "./ZamanindaTedarikAnalizi";

function Main() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/arac-analiz" element={<AracTedarikAnaliz />} />
                <Route path="/zamaninda-analiz" element={<ZamanindaTedarikAnalizi />} /> {/* Bunu ekle */}
            </Routes>
        </Router>
    );
}

export default Main;
