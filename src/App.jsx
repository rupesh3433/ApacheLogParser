import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import ApacheLogGenerator from "./pages/ApacheLogGenerator";
import ApacheLogParser from "./pages/ApacheLogParser";
import AnomalyDetector from "./pages/AnomalyDetector"; // Fixed typo in import name
import Dashboard from "./pages/Dashboard";

// ----------------------
// Main App Component with Routing
// ----------------------
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-6 px-4">
                <div className="container mx-auto">
                  <h1 className="text-3xl sm:text-4xl font-bold">
                    Apache Web Logs Analyzer
                  </h1>
                  <p className="mt-2 text-lg">
                    Smart solutions for parsing, detecting anomalies, and analyzing your Apache logs.
                  </p>
                </div>
              </header>
              <Dashboard />
              <footer className="bg-slate-800 text-slate-300 py-4">
                <div className="container mx-auto text-center">
                  <p>&copy; {new Date().getFullYear()} Anomaly Detection App. All rights reserved.</p>
                </div>
              </footer>
            </>
          }
        />
        <Route path="/log-generator" element={<ApacheLogGenerator />} />
        <Route path="/apache-log-parser" element={<ApacheLogParser />} />
        <Route path="/anomaly-detector" element={<AnomalyDetector />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
