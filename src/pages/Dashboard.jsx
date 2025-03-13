import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

function Dashboard() {
  const navigate = useNavigate();
  const services = [
    {
      key: "generator",
      title: "Apache Log Generator",
      description: "Generate custom Apache access logs with configurable settings.",
      route: "/log-generator",
    },
    {
      key: "parser",
      title: "Apache Log Parser",
      description: "Convert your Apache logs into structured CSV data.",
      route: "/apache-log-parser",
    },
    {
      key: "detector",
      title: "Anomaly Detector",
      description: "Detect anomalies in your logs with our ML model.",
      route: "/anomaly-detector",
    },
  ];

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to Dashboard</h1>
        <p className="text-lg text-gray-600 mt-2">
          Choose a service to analyze your Apache logs efficiently.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {services.map((service, index) => (
          <motion.div
            key={service.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card
              className="cursor-pointer bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all border border-gray-200"
              onClick={() => navigate(service.route)}
            >
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 font-semibold">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{service.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;