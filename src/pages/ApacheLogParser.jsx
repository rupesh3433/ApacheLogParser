import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Example shadcn UI components (adjust import paths as per your project structure)
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

// Maximum allowed file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

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

  // Use Vite's env variables with a fallback
  const rawApiUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const API_UPLOAD_URL = `${rawApiUrl}/upload`;
  const API_DOWNLOAD_BASE = `${rawApiUrl}/download`;

  // React Router navigation hook
  const navigate = useNavigate();

  useEffect(() => {
    console.log("API_UPLOAD_URL:", API_UPLOAD_URL);
    console.log("API_DOWNLOAD_BASE:", API_DOWNLOAD_BASE);
  }, [API_UPLOAD_URL, API_DOWNLOAD_BASE]);

  // Cleanup blob URL on unmount or when downloadLink changes
  useEffect(() => {
    return () => {
      if (downloadLink) {
        URL.revokeObjectURL(downloadLink);
      }
    };
  }, [downloadLink]);

  // Validate file extension (.log)
  const isValidFileType = (file) => {
    const fileName = file.name.toLowerCase();
    return fileName.endsWith(".log");
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (!isValidFileType(selectedFile)) {
        setError("Invalid file type. Please select a .log file.");
        setFile(null);
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("File size exceeds 5MB. Please upload a smaller file.");
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
        setError("File size exceeds 5MB. Please upload a smaller file.");
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

  // Helper: delay function
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Upload with retry mechanism (up to 3 attempts with exponential backoff)
  const uploadFileWithRetry = async (
    formData,
    retries = 3,
    delayTime = 1000
  ) => {
    try {
      const response = await axios.post(API_UPLOAD_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      });
      return response;
    } catch (err) {
      if (retries > 0) {
        await delay(delayTime);
        return await uploadFileWithRetry(formData, retries - 1, delayTime * 2);
      } else {
        throw err;
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a .log file");
      return;
    }

    setError("");
    setIsLoading(true);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await uploadFileWithRetry(formData);
      // Create a temporary URL for the CSV blob response
      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data], { type: "text/csv" })
      );
      setDownloadLink(blobUrl);
      setUploadSuccess(true);
      setActiveTab("download");
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error uploading file or processing data."
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
      {/* Header with Return Button at top right */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-6 md:py-10 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Apache Log Parser
            </h1>
            <p className="mt-2 text-1xl opacity-90 max-w-2xl">
              Convert your{" "}
              <span className="font-semibold">Apache Log files</span>{" "}
               into structured CSV data for easy analysis.
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
          <Tabs
            defaultValue="upload"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-8"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="format">Format Info</TabsTrigger>
              <TabsTrigger value="upload">Upload Log</TabsTrigger>
              <TabsTrigger value="download" disabled={!downloadLink}>
                Download CSV
              </TabsTrigger>
            </TabsList>

            {/* Format Information Tab */}
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
                      Example of a single line in the Apache Combined Log
                      Format:
                    </p>
                    <pre className="bg-slate-900 text-white p-4 rounded-lg overflow-x-auto font-mono text-sm border border-slate-700 shadow-md">
                      <code>
                        127.0.0.1 - - [10/Oct/2000:13:55:36 -0700] "GET
                        /apache_pb.gif HTTP/1.0" 200 2326
                        "http://example.com/start.html" "Mozilla/4.08 [en]
                        (Win98; I; Nav)"
                      </code>
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <FileText size={20} className="text-blue-600" />
                    Output CSV Format
                  </CardTitle>
                  <CardDescription>
                    The processed CSV file will contain these columns.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-slate-200 rounded-lg">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-4 py-2 border border-slate-200 text-left">
                            ip
                          </th>
                          <th className="px-4 py-2 border border-slate-200 text-left">
                            timestamp
                          </th>
                          <th className="px-4 py-2 border border-slate-200 text-left">
                            method
                          </th>
                          <th className="px-4 py-2 border border-slate-200 text-left">
                            url
                          </th>
                          <th className="px-4 py-2 border border-slate-200 text-left">
                            status
                          </th>
                          <th className="px-4 py-2 border border-slate-200 text-left">
                            size
                          </th>
                          <th className="px-4 py-2 border border-slate-200 text-left">
                            referrer
                          </th>
                          <th className="px-4 py-2 border border-slate-200 text-left">
                            user_agent
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-2 border border-slate-200">
                            127.0.0.1
                          </td>
                          <td className="px-4 py-2 border border-slate-200">
                            2000-10-10 13:55:36
                          </td>
                          <td className="px-4 py-2 border border-slate-200">
                            GET
                          </td>
                          <td className="px-4 py-2 border border-slate-200">
                            /apache_pb.gif
                          </td>
                          <td className="px-4 py-2 border border-slate-200">
                            200
                          </td>
                          <td className="px-4 py-2 border border-slate-200">
                            2326
                          </td>
                          <td className="px-4 py-2 border border-slate-200">
                            http://example.com/start.html
                          </td>
                          <td className="px-4 py-2 border border-slate-200">
                            Mozilla/4.08 [en] (Win98; I; Nav)
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Upload size={20} className="text-blue-600" />
                    Upload Apache Log File
                  </CardTitle>
                  <CardDescription>
                    Select or drag and drop your <strong>.log</strong> file for
                    processing.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert
                      variant="destructive"
                      className="bg-red-50 border-red-300 text-red-800"
                    >
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {uploadSuccess && (
                    <Alert className="bg-green-50 border-green-300 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Success!</AlertTitle>
                      <AlertDescription>
                        Your log file has been successfully processed. You can
                        now download the CSV.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div
                    className={`border-2 ${
                      isDragging ? "border-blue-500" : "border-slate-300"
                    } border-dashed rounded-lg p-6 text-center transition-colors`}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <FileText size={48} className="text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-700">
                          {file
                            ? file.name
                            : "Drag and drop your .log file here"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {file
                            ? `${(file.size / 1024).toFixed(
                                2
                              )} KB • Last modified: ${new Date(
                                file.lastModified
                              ).toLocaleDateString()}`
                            : "or click below to browse files"}
                        </p>
                      </div>
                      <div className="w-full">
                        {/* Hidden File Input */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleFileChange}
                        />

                        {/* Mobile layout: vertical stack */}
                        <div className="md:hidden flex flex-col gap-3">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={openFileDialog}
                          >
                            Select File
                          </Button>
                          <Button
                            onClick={handleUpload}
                            disabled={!file || isLoading}
                            className="w-full"
                          >
                            {isLoading ? "Processing..." : "Process Log"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={clearFile}
                            disabled={!file}
                            className="w-full"
                          >
                            Clear File
                          </Button>
                        </div>

                        {/* Medium and larger screens: grid with 2 rows and 2 columns */}
                        <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-3">
                          {/* First row: button spans 2 columns */}
                          <Button
                            variant="outline"
                            className="col-span-2"
                            onClick={openFileDialog}
                          >
                            Select File
                          </Button>
                          {/* Second row: two buttons side by side */}
                          <Button
                            onClick={handleUpload}
                            disabled={!file || isLoading}
                            className=""
                          >
                            {isLoading ? "Processing..." : "Process Log"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={clearFile}
                            disabled={!file}
                            className=""
                          >
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
                      <CheckCircle
                        size={64}
                        className="mx-auto text-green-500"
                      />
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-slate-800">
                          Processing Complete!
                        </h3>
                        <p className="text-slate-600 max-w-md mx-auto">
                          Your Apache log file has been successfully converted
                          to a cleaned CSV format.
                        </p>
                      </div>
                      <a
                        href={downloadLink}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                        download
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

      {/* Footer with Return Button at bottom left */}
      <footer className="mt-auto bg-slate-800 text-slate-300 py-6 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <Button
            variant="outline"
            onClick={handleReturnToDashboard}
            className="mb-4 md:mb-0"
          >
            Back to Dashboard
          </Button>
          <div className="text-center">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Apache Log Parser
            </p>
            <p className="text-xs text-slate-400 mt-1">All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ApacheLogParser;
