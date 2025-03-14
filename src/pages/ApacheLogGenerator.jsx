import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Shadcn UI components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Info, CheckCircle, AlertCircle } from "lucide-react";

function ApacheLogGenerator() {
  const [totalRows, setTotalRows] = useState(10000);
  const [maliciousRatio, setMaliciousRatio] = useState(0.5);
  const [generating, setGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [generateSuccess, setGenerateSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("generator");

  // API URL from environment variable with fallback
  const VITE_API_GENERATE_URL = import.meta.env.VITE_API_GENERATE_URL

  const navigate = useNavigate();

  useEffect(() => {
    console.log("API_GENERATE_URL:", VITE_API_GENERATE_URL);
  }, [VITE_API_GENERATE_URL]);

  const handleGenerate = async () => {
    setError("");
    setGenerating(true);
    setDownloadUrl("");
    setGenerateSuccess(false);

    if (totalRows <= 0) {
      setError("Total entries must be greater than zero.");
      setGenerating(false);
      return;
    }
    if (maliciousRatio < 0 || maliciousRatio > 1) {
      setError("Malicious ratio must be between 0 and 1.");
      setGenerating(false);
      return;
    }

    // For large files (>= 100,000 rows), use dynamic form submission
    if (totalRows >= 100000) {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = VITE_API_GENERATE_URL;
      form.enctype = "application/x-www-form-urlencoded";
      form.target = "_blank"; // Open in a new tab to force download

      const inputTotal = document.createElement("input");
      inputTotal.type = "hidden";
      inputTotal.name = "total_entries";
      inputTotal.value = totalRows;
      form.appendChild(inputTotal);

      const inputRatio = document.createElement("input");
      inputRatio.type = "hidden";
      inputRatio.name = "malicious_ratio";
      inputRatio.value = maliciousRatio;
      form.appendChild(inputRatio);

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      setGenerateSuccess(true);
      setActiveTab("download");
      setGenerating(false);
      return;
    }

    // Otherwise, use fetch for smaller files
    try {
      const response = await fetch(VITE_API_GENERATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_entries: totalRows,
          malicious_ratio: maliciousRatio,
        }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setDownloadUrl(url);
        setGenerateSuccess(true);
        setActiveTab("download");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to generate logs. Please try again.");
      }
    } catch (error) {
      console.error("Error generating logs:", error);
      setError("Error connecting to the server. Please check your connection and try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `generated_log_${totalRows}_${maliciousRatio}.log`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header with Return Button */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-6 md:py-10 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Apache Log Generator</h1>
            <p className="mt-2 text-lg opacity-90 max-w-2xl">
              Generate sample Apache access logs with customizable parameters for testing and development.
            </p>
          </div>
          <div>
            <Button variant="outline" onClick={() => navigate("/")}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="container mx-auto px-4 flex-1 my-8 w-full">
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="generator">Generate Logs</TabsTrigger>
              <TabsTrigger value="download" disabled={!downloadUrl}>Download</TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Info size={20} className="text-blue-600" />
                    Apache Log Format Information
                  </CardTitle>
                  <CardDescription>
                    Understanding the Apache combined log format used for generated logs.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 mb-2">
                    Apache access logs (using the combined log format) typically look like:
                  </p>
                  <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
                    %h %l %u [%t] "%r" %s %b "%{"{"}Referer{"}"}" "%{"{"}User-agent{"}"}"
                  </div>
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Format Description:</h3>
                    <ul className="space-y-2 text-gray-700 list-disc pl-5">
                      <li><strong>%h</strong>: Client IP address</li>
                      <li><strong>%l</strong>: Remote logname (usually "-")</li>
                      <li><strong>%u</strong>: Authenticated user (if any)</li>
                      <li><strong>[%t]</strong>: Timestamp when the request was received</li>
                      <li><strong>"%r"</strong>: Request line (HTTP method, URL, HTTP version)</li>
                      <li><strong>%s</strong>: HTTP status code returned</li>
                      <li><strong>%b</strong>: Size of the response in bytes</li>
                      <li><strong>"%{"{"}Referer{"}"}"</strong>: Referrer URL</li>
                      <li><strong>"%{"{"}User-agent{"}"}"</strong>: User agent string</li>
                    </ul>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Example Log Line:</h3>
                    <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
                      192.168.1.1 - - [10/Oct/2024:13:55:36 -0700] "GET /index.html HTTP/1.1" 200 2326 "http://www.example.com" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Generator Tab */}
            <TabsContent value="generator">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <FileText size={20} className="text-blue-600" />
                    Generate Apache Log File
                  </CardTitle>
                  <CardDescription>
                    Customize parameters to generate sample Apache log files.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="bg-red-50 border-red-300 text-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {generateSuccess && (
                    <Alert className="bg-green-50 border-green-300 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Success!</AlertTitle>
                      <AlertDescription>Your log file has been successfully generated.</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700" htmlFor="totalRows">
                        Total Entries
                      </label>
                      <input
                        id="totalRows"
                        type="number"
                        value={totalRows}
                        onChange={(e) => setTotalRows(parseInt(e.target.value) || 0)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Number of log entries to generate. Higher values will take longer to process.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700" htmlFor="maliciousRatio">
                        Malicious Ratio (0 - 1)
                      </label>
                      <input
                        id="maliciousRatio"
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={maliciousRatio}
                        onChange={(e) => setMaliciousRatio(parseFloat(e.target.value) || 0)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Proportion of logs that will contain malicious patterns. 0 = no malicious entries, 1 = all entries are malicious.
                      </p>
                    </div>
                    <div className="pt-4">
                      <Button onClick={handleGenerate} disabled={generating} className="w-full md:w-auto">
                        {generating ? "Generating..." : "Generate Log File"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Download Tab */}
            <TabsContent value="download">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Download size={100} className="text-blue-600" />
                    Download Generated Log
                  </CardTitle>
                  <CardDescription>Your log file has been generated successfully.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {downloadUrl ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-4">
                        Log File Ready for Download
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Your Apache log file has been generated with {totalRows.toLocaleString()} entries and a malicious ratio of {maliciousRatio}.
                      </p>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Log File
                      </Button>
                    </div>
                  ) : (
                    <p className="text-center text-gray-600">
                      No download is available. Please generate a log file first.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer with Return Button */}
      <footer className="mt-auto bg-slate-800 text-slate-300 py-6 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <Button variant="outline" onClick={() => navigate("/")} className="mb-4 md:mb-0">
            Back to Dashboard
          </Button>
          <div className="text-center">
            <p className="text-sm">&copy; {new Date().getFullYear()} Apache Log Generator</p>
            <p className="text-xs text-slate-400 mt-1">All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ApacheLogGenerator;
