import React, { useState, useEffect, useRef } from "react";
// Removed axios import since we use fetch now
import { useNavigate } from "react-router-dom";

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
import {
  ArrowDownToLine,
  Upload,
  FileText,
  Info,
  CheckCircle,
} from "lucide-react";

// Maximum allowed file size (300MB)
const MAX_FILE_SIZE = 300 * 1024 * 1024;

function ApacheLogParser() {
  const [file, setFile] = useState(null);
  const [downloadLink, setDownloadLink] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [isDragging, setIsDragging] = useState(false);

  // File input ref for programmatically opening file dialog
  const fileInputRef = useRef(null);
  // React Router navigation hook
  const navigate = useNavigate();

  // Define the API URL once from the environment variable.
  const VITE_API_UPLOAD_URL = import.meta.env.VITE_API_UPLOAD_URL;
  console.log("API_UPLOAD_URL:", VITE_API_UPLOAD_URL);

  // Cleanup blob URL on unmount or when downloadLink changes
  useEffect(() => {
    return () => {
      if (downloadLink) {
        URL.revokeObjectURL(downloadLink);
      }
    };
  }, [downloadLink]);

  // Validate file extension (.log)
  const isValidFileType = (file) => file.name.toLowerCase().endsWith(".log");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (!isValidFileType(selectedFile)) {
        setError("Invalid file type. Please select a .log file.");
        setFile(null);
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("File size exceeds 300MB. Please upload a smaller file.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError("");
      setUploadSuccess(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!isValidFileType(droppedFile)) {
        setError("Invalid file type. Please drop a .log file.");
        setFile(null);
        return;
      }
      if (droppedFile.size > MAX_FILE_SIZE) {
        setError("File size exceeds 300MB. Please upload a smaller file.");
        setFile(null);
        return;
      }
      setFile(droppedFile);
      setError("");
      setUploadSuccess(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Upload using fetch with streaming response handling
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a .log file");
      console.log("No file selected");
      return;
    }
    setError("");
    setIsLoading(true);
    setUploadSuccess(false);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(VITE_API_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errMsg = await response.text();
        setError(errMsg || "Error processing file.");
        setIsLoading(false);
        return;
      }

      // Read the response stream in chunks
      const reader = response.body.getReader();
      const chunks = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;
        console.log(`Received ${receivedLength} bytes`);
      }

      // Combine chunks into one Blob and create a URL for download
      const blob = new Blob(chunks, { type: "text/csv" });
      const blobUrl = window.URL.createObjectURL(blob);
      setDownloadLink(blobUrl);
      setUploadSuccess(true);
      setActiveTab("download");
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(
        err.message || "Error uploading file or processing data."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError("");
    setUploadSuccess(false);
    setDownloadLink(null);
  };

  // Function to open file dialog programmatically
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Function to return to Dashboard
  const handleReturnToDashboard = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-6 md:py-10 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Apache Log Parser</h1>
            <p className="mt-2 text-1xl opacity-90 max-w-2xl">
              Convert your <span className="font-semibold">Apache Log files</span> into structured CSV data for easy analysis.
            </p>
          </div>
          <div>
            <Button variant="outline" onClick={handleReturnToDashboard}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="container mx-auto px-4 flex-1 my-8 w-full">
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="format">Format Info</TabsTrigger>
              <TabsTrigger value="upload">Upload Log</TabsTrigger>
              <TabsTrigger value="download" disabled={!downloadLink}>Download CSV</TabsTrigger>
            </TabsList>

            {/* Format Info Tab */}
            <TabsContent value="format" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Info size={20} className="text-blue-600" />
                    Input Log Format
                  </CardTitle>
                  <CardDescription>
                    Your Apache log file should follow the Combined Log Format.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Example of a single line in the Apache Combined Log Format:
                    </p>
                    <pre className="bg-slate-900 text-white p-4 rounded-lg overflow-x-auto font-mono text-sm border border-slate-700 shadow-md">
                      <code>
                        127.0.0.1 - - [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326 "http://example.com/start.html" "Mozilla/4.08 [en] (Win98; I; Nav)"
                      </code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Upload Log Tab */}
            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Upload size={20} className="text-blue-600" />
                    Upload Apache Log File
                  </CardTitle>
                  <CardDescription>
                    Select or drag and drop your <strong>.log</strong> file for processing.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="bg-red-50 border-red-300 text-red-800">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {uploadSuccess && (
                    <Alert className="bg-green-50 border-green-300 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Success!</AlertTitle>
                      <AlertDescription>
                        Your log file has been successfully processed. You can now download the CSV.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div
                    className={`border-2 ${isDragging ? "border-blue-500" : "border-slate-300"} border-dashed rounded-lg p-6 text-center transition-colors`}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <FileText size={48} className="text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-700">
                          {file ? file.name : "Drag and drop your .log file here"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {file
                            ? `${(file.size / 1024).toFixed(2)} KB • Last modified: ${new Date(file.lastModified).toLocaleDateString()}`
                            : "or click below to browse files"}
                        </p>
                      </div>
                      <div className="w-full">
                        {/* Hidden File Input */}
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                        {/* Mobile layout: vertical stack */}
                        <div className="md:hidden flex flex-col gap-3">
                          <Button variant="outline" className="w-full" onClick={openFileDialog}>
                            Select File
                          </Button>
                          <Button onClick={handleUpload} disabled={!file || isLoading} className="w-full">
                            {isLoading ? "Processing..." : "Process Log"}
                          </Button>
                          <Button variant="outline" onClick={clearFile} disabled={!file} className="w-full">
                            Clear File
                          </Button>
                        </div>
                        {/* Medium and larger screens: grid layout */}
                        <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-3">
                          <Button variant="outline" className="col-span-2" onClick={openFileDialog}>
                            Select File
                          </Button>
                          <Button onClick={handleUpload} disabled={!file || isLoading}>
                            {isLoading ? "Processing..." : "Process Log"}
                          </Button>
                          <Button variant="outline" onClick={clearFile} disabled={!file}>
                            Clear File
                          </Button>
                        </div>
                      </div>
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
                    <ArrowDownToLine size={20} className="text-blue-600" />
                    Download Processed CSV
                  </CardTitle>
                  <CardDescription>
                    Your log file has been processed and is ready for download.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-10">
                  {downloadLink && (
                    <div className="text-center space-y-6">
                      <CheckCircle size={64} className="mx-auto text-green-500" />
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-slate-800">
                          Processing Complete!
                        </h3>
                        <p className="text-slate-600 max-w-md mx-auto">
                          Your Apache log file has been successfully converted to a cleaned CSV format.
                        </p>
                      </div>
                      <a
                        href={downloadLink}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                        download="parsed.csv"
                      >
                        <ArrowDownToLine size={18} />
                        Download CSV File
                      </a>
                      <p className="text-sm text-slate-500 mt-4">
                        Need to process another file?{" "}
                        <Button
                          variant="link"
                          className="p-0 h-auto font-normal"
                          onClick={() => {
                            setActiveTab("upload");
                            clearFile();
                          }}
                        >
                          Go back to upload
                        </Button>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-slate-800 text-slate-300 py-6 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <Button variant="outline" onClick={handleReturnToDashboard} className="mb-4 md:mb-0">
            Back to Dashboard
          </Button>
          <div className="text-center">
            <p className="text-sm">&copy; {new Date().getFullYear()} Apache Log Parser</p>
            <p className="text-xs text-slate-400 mt-1">All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ApacheLogParser;
