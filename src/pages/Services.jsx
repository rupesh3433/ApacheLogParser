import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// ----------------------
// Higher-Order Service Page Component
// ----------------------
function ServicePage({ title, children }) {
    const navigate = useNavigate();
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-6 px-4">
          <div className="container mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold">{title}</h1>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
        <div className="container mx-auto px-4 py-4">
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Dashboard
          </Button>
        </div>
        <footer className="bg-slate-800 text-slate-300 py-4">
          <div className="container mx-auto text-center">
            <p>&copy; {new Date().getFullYear()} Anomaly Detection App. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  }
  
// ----------------------
// Service Pages
// ----------------------

// Anomaly Detector Page
function AnomalyDetectorPage() {
    return (
      <ServicePage title="Anomaly Detector">
        <Card className="mx-auto w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Anomaly Detector Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Leverage our machine learning model to detect anomalies in your Apache logs.
            </p>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={6}
              placeholder="Paste your Apache log data here..."
            />
            <div className="mt-4 flex justify-end">
              <Button variant="primary">Detect Anomalies</Button>
            </div>
          </CardContent>
        </Card>
      </ServicePage>
    );
  }
  
// Real-Time Monitoring Page
function RealTimeMonitoringPage() {
    return (
      <ServicePage title="Real-Time Monitoring">
        <Card className="mx-auto w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Real-Time Monitoring Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Monitor your Apache logs live and get instant alerts on suspicious activities.
            </p>
          </CardContent>
        </Card>
      </ServicePage>
    );
  }
  
// Log Analytics Page
function LogAnalyticsPage() {
    return (
      <ServicePage title="Log Analytics Dashboard">
        <Card className="mx-auto w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Log Analytics Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Visualize your log data with interactive charts and insightful metrics.
            </p>
          </CardContent>
        </Card>
      </ServicePage>
    );
  }
  
// Traffic Analysis Page
function TrafficAnalysisPage() {
    return (
      <ServicePage title="Traffic Analysis">
        <Card className="mx-auto w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Traffic Analysis Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Analyze website traffic from your Apache logs to understand user behavior.
            </p>
          </CardContent>
        </Card>
      </ServicePage>
    );
  }
  
// Security Insights Page
function SecurityInsightsPage() {
    return (
      <ServicePage title="Security Insights">
        <Card className="mx-auto w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Security Insights Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Gain deep insights into potential security threats hidden within your log files.
            </p>
          </CardContent>
        </Card>
      </ServicePage>
    );
  }
  
// Error Reporting Page
function ErrorReportingPage() {
    return (
      <ServicePage title="Error Reporting">
        <Card className="mx-auto w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Error Reporting Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Automatically generate error reports from your Apache logs to help with debugging.
            </p>
          </CardContent>
        </Card>
      </ServicePage>
    );
  }

// ----------------------
// Export All Service Pages
// ----------------------
export {
  AnomalyDetectorPage,
  RealTimeMonitoringPage,
  LogAnalyticsPage,
  TrafficAnalysisPage,
  SecurityInsightsPage,
  ErrorReportingPage,
};
