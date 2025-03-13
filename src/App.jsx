import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ApacheLogParser from "./pages/ApacheLogParser";
import AnamolyDetector from "./pages/AnamolyDetector";
import Dashboard from "./pages/Dashboard";
import {
  RealTimeMonitoringPage,
  LogAnalyticsPage,
  TrafficAnalysisPage,
  SecurityInsightsPage,
  ErrorReportingPage,
} from "./pages/Services";


// ----------------------
// Main App Component with Routing
// ----------------------
function App() {
  return (
    <BrowserRouter>
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
        <Route path="/apache-log-parser" element={<ApacheLogParser/>} />
        <Route path="/anomaly-detector" element={<AnamolyDetector />} />
        <Route path="/realtime-monitoring" element={<RealTimeMonitoringPage />} />
        <Route path="/log-analytics" element={<LogAnalyticsPage />} />
        <Route path="/traffic-analysis" element={<TrafficAnalysisPage />} />
        <Route path="/security-insights" element={<SecurityInsightsPage />} />
        <Route path="/error-reporting" element={<ErrorReportingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
