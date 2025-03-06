
import React, { createContext, useContext, useState, useEffect } from "react";
import { ObservationType } from "@/types/types";
import { toast } from "@/components/ui/use-toast";

interface DataContextType {
  observations: ObservationType[];
  addObservation: (observation: ObservationType) => void;
  deleteObservation: (id: string) => void;
  updateObservation: (id: string, updated: Partial<ObservationType>) => void;
  syncStatus: "synced" | "pending" | "error";
  exportData: (format: "csv" | "json") => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [observations, setObservations] = useState<ObservationType[]>([]);
  const [syncStatus, setSyncStatus] = useState<"synced" | "pending" | "error">("synced");

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem("biodataObservations");
    if (storedData) {
      try {
        setObservations(JSON.parse(storedData));
      } catch (error) {
        console.error("Failed to parse stored observations:", error);
        toast({
          title: "Error",
          description: "Failed to load stored data",
          variant: "destructive",
        });
      }
    }
  }, []);

  // Save data to localStorage whenever observations change
  useEffect(() => {
    localStorage.setItem("biodataObservations", JSON.stringify(observations));
  }, [observations]);

  const addObservation = (observation: ObservationType) => {
    setObservations((prev) => [observation, ...prev]);
    toast({
      title: "Observation added",
      description: "Your observation has been saved locally",
    });
  };

  const deleteObservation = (id: string) => {
    setObservations((prev) => prev.filter((obs) => obs.id !== id));
    toast({
      title: "Observation deleted",
      description: "The observation has been removed",
    });
  };

  const updateObservation = (id: string, updated: Partial<ObservationType>) => {
    setObservations((prev) =>
      prev.map((obs) => (obs.id === id ? { ...obs, ...updated } : obs))
    );
    toast({
      title: "Observation updated",
      description: "Your changes have been saved",
    });
  };

  const exportData = (format: "csv" | "json") => {
    try {
      let content: string;
      let fileName: string;
      let mimeType: string;

      if (format === "csv") {
        // Create CSV content
        const headers = "ID,Date,Species,Location,Latitude,Longitude,Notes\n";
        const rows = observations.map(
          (obs) =>
            `"${obs.id}","${obs.date}","${obs.species}","${obs.location}","${obs.coordinates.latitude}","${obs.coordinates.longitude}","${obs.notes}"`
        );
        content = headers + rows.join("\n");
        fileName = `biodata-export-${new Date().toISOString().split("T")[0]}.csv`;
        mimeType = "text/csv;charset=utf-8;";
      } else {
        // JSON format
        content = JSON.stringify(observations, null, 2);
        fileName = `biodata-export-${new Date().toISOString().split("T")[0]}.json`;
        mimeType = "application/json;charset=utf-8;";
      }

      // Create download link
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: `Data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your data",
        variant: "destructive",
      });
    }
  };

  return (
    <DataContext.Provider
      value={{
        observations,
        addObservation,
        deleteObservation,
        updateObservation,
        syncStatus,
        exportData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
