import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Shadcn UI components (adjust import paths as per your project)
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

// Import Pie chart components from react-chartjs-2 and Chart.js
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

// Maximum allowed file size (50MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024;

function AnamolyDetector() {
  const [file, setFile] = useState(null);
  const [distributionData, setDistributionData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [isDragging, setIsDragging] = useState(false);

  // File input ref for programmatically opening file dialog
  const fileInputRef = useRef(null);

  // Use Vite's env variables with a fallback
  const rawApiUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:1000";
  const API_PREDICT_URL = `${rawApiUrl}/predict`;

  // React Router navigation hook
  const navigate = useNavigate();

  useEffect(() => {
    console.log("API_PREDICT_URL:", API_PREDICT_URL);
  }, [API_PREDICT_URL]);

  // Cleanup blob URL on unmount (if used for any downloads)
  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);

  // Update the file type validation to include Excel file extensions
  const isValidFileType = (file) => {
    const fileName = file.name.toLowerCase();
    return (
      fileName.endsWith(".csv") ||
      fileName.endsWith(".xls") ||
      fileName.endsWith(".xlsx")
    );
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (!isValidFileType(selectedFile)) {
        setError("Invalid file type. Please select a .csv file.");
        setFile(null);
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("File size exceeds 50MB. Please upload a smaller file.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError("");
      setUploadSuccess(false);
      setDistributionData(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!isValidFileType(droppedFile)) {
        setError("Invalid file type. Please drop a .csv file.");
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
      setDistributionData(null);
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

  // Helper: delay function for retry mechanism (if needed)
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Upload file with retry mechanism (if needed)
  const uploadFileWithRetry = async (formData, retries = 3, delayTime = 1000) => {
    try {
      const response = await axios.post(API_PREDICT_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
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
      setError("Please select a .csv file");
      return;
    }
  
    setError("");
    setIsLoading(true);
    setUploadSuccess(false);
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await uploadFileWithRetry(formData);
  
      // Handle empty CSV response
      if (response.data === "emptyCSV") {
        setError("The uploaded CSV file is empty. Please upload a valid dataset.");
        setIsLoading(false);
        return;
      }
  
      // Assuming the response contains JSON with totalRows, normalCount, maliciousCount
      setDistributionData(response.data);
      setUploadSuccess(true);
      setActiveTab("results");
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
    setDistributionData(null);
  };

  // Function to open file dialog programmatically
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Function to return to Dashboard
  const handleReturnToDashboard = () => {
    navigate("/");
  };

  // Prepare Pie chart data if distributionData exists
  const pieChartData = distributionData
    ? {
        labels: ["Normal Access", "Malicious Access"],
        datasets: [
          {
            data: [
              distributionData.normalCount,
              distributionData.maliciousCount,
            ],
            backgroundColor: ["#36A2EB", "#FF6384"],
            hoverBackgroundColor: ["#36A2EB", "#FF6384"],
          },
        ],
      }
    : null;

  // Calculate percentages if distributionData exists
  const normalPercentage = distributionData
    ? ((distributionData.normalCount / distributionData.totalRows) * 100).toFixed(2)
    : 0;
  const maliciousPercentage = distributionData
    ? ((distributionData.maliciousCount / distributionData.totalRows) * 100).toFixed(2)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header with Return Button */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-6 md:py-10 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Anamoly Detector
            </h1>
            <p className="mt-2 text-1xl opacity-90 max-w-2xl">
              Upload your CSV dataset for prediction to view the distribution of
              Normal and Malicious access.
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
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="upload">Upload CSV</TabsTrigger>
              <TabsTrigger value="results" disabled={!distributionData}>
                Results
              </TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Info size={20} className="text-blue-600" />
                    CSV Input Format
                  </CardTitle>
                  <CardDescription>
                    Your CSV file should contain your dataset for prediction. The
                    service will analyze the file and return the total number of
                    rows along with the distribution of Normal (class 0) and
                    Malicious (class 1) accesses.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Please ensure your CSV file is properly formatted and under 50MB. This service is Highly Recommended to use After Parsing log file with our own Log Parser you can find in Dashboard.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Upload CSV Tab */}
            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Upload size={20} className="text-blue-600" />
                    Upload CSV Dataset
                  </CardTitle>
                  <CardDescription>
                    Select or drag and drop your <strong>.csv</strong> file for analysis.
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
                        Your CSV file has been successfully processed.
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
                          {file ? file.name : "Drag and drop your .csv file here"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {file
                            ? `${(file.size / 1024).toFixed(2)} KB • Last modified: ${new Date(
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
                            {isLoading ? "Processing..." : "Process CSV"}
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
                        <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-3">
                          <Button
                            variant="outline"
                            className="col-span-2"
                            onClick={openFileDialog}
                          >
                            Select File
                          </Button>
                          <Button
                            onClick={handleUpload}
                            disabled={!file || isLoading}
                          >
                            {isLoading ? "Processing..." : "Process CSV"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={clearFile}
                            disabled={!file}
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

            {/* Results / Distribution Tab */}
            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <ArrowDownToLine size={20} className="text-blue-600" />
                    Analysis Results
                  </CardTitle>
                  <CardDescription>
                    Review the distribution of accesses in your CSV dataset.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {distributionData ? (
                    <>
                      <div className="space-y-2">
                        <p className="text-lg font-medium">
                          Total Rows: {distributionData.totalRows}
                        </p>
                        <p className="text-sm text-gray-700">
                          Normal Access: {distributionData.normalCount} (
                          {normalPercentage}%)
                        </p>
                        <p className="text-sm text-gray-700">
                          Malicious Access: {distributionData.maliciousCount} (
                          {maliciousPercentage}%)
                        </p>
                      </div>
                      {pieChartData && (
                        <div className="max-w-md mx-auto">
                          <Pie data={pieChartData} />
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-center text-gray-600">
                      No analysis results to display. Please upload a CSV file.
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
          <Button
            variant="outline"
            onClick={handleReturnToDashboard}
            className="mb-4 md:mb-0"
          >
            Back to Dashboard
          </Button>
          <div className="text-center">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} CSV Distribution Analyzer
            </p>
            <p className="text-xs text-slate-400 mt-1">All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AnamolyDetector;
