
import React, { createContext, useContext, useState, useEffect } from "react";
import { ObservationType, ProjectType } from "@/types/types";
import { toast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";

interface DataContextType {
  observations: ObservationType[];
  projects: ProjectType[];
  currentProject: ProjectType | null;
  setCurrentProject: (project: ProjectType | null) => void;
  addObservation: (observation: ObservationType) => void;
  deleteObservation: (id: string) => void;
  updateObservation: (id: string, updated: Partial<ObservationType>) => void;
  addProject: (project: ProjectType) => void;
  deleteProject: (id: string) => void;
  updateProject: (id: string, updated: Partial<ProjectType>) => void;
  syncStatus: "synced" | "pending" | "error";
  exportData: (format: "excel" | "json") => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [observations, setObservations] = useState<ObservationType[]>([]);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectType | null>(null);
  const [syncStatus, setSyncStatus] = useState<"synced" | "pending" | "error">("synced");

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedObservations = localStorage.getItem("biodataObservations");
    const storedProjects = localStorage.getItem("biodataProjects");
    const storedCurrentProject = localStorage.getItem("biodataCurrentProject");

    if (storedObservations) {
      try {
        setObservations(JSON.parse(storedObservations));
      } catch (error) {
        console.error("Failed to parse stored observations:", error);
        toast({
          title: "Error",
          description: "Failed to load stored observations",
          variant: "destructive",
        });
      }
    }

    if (storedProjects) {
      try {
        setProjects(JSON.parse(storedProjects));
      } catch (error) {
        console.error("Failed to parse stored projects:", error);
        toast({
          title: "Error",
          description: "Failed to load stored projects",
          variant: "destructive",
        });
      }
    }

    if (storedCurrentProject) {
      try {
        setCurrentProject(JSON.parse(storedCurrentProject));
      } catch (error) {
        console.error("Failed to parse current project:", error);
      }
    }
  }, []);

  // Save data to localStorage whenever observations or projects change
  useEffect(() => {
    localStorage.setItem("biodataObservations", JSON.stringify(observations));
  }, [observations]);

  useEffect(() => {
    localStorage.setItem("biodataProjects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (currentProject) {
      localStorage.setItem("biodataCurrentProject", JSON.stringify(currentProject));
    } else {
      localStorage.removeItem("biodataCurrentProject");
    }
  }, [currentProject]);

  const addObservation = (observation: ObservationType) => {
    setObservations((prev) => [observation, ...prev]);
    toast({
      title: "Observação adicionada",
      description: "Sua observação foi salva localmente",
    });
  };

  const deleteObservation = (id: string) => {
    setObservations((prev) => prev.filter((obs) => obs.id !== id));
    toast({
      title: "Observação excluída",
      description: "A observação foi removida",
    });
  };

  const updateObservation = (id: string, updated: Partial<ObservationType>) => {
    setObservations((prev) =>
      prev.map((obs) => {
        if (obs.id === id) {
          const updatedObs = { ...obs, ...updated, updatedAt: Date.now() };
          return updatedObs;
        }
        return obs;
      })
    );
    toast({
      title: "Observação atualizada",
      description: "Suas alterações foram salvas",
    });
  };

  const addProject = (project: ProjectType) => {
    setProjects((prev) => [project, ...prev]);
    setCurrentProject(project);
    toast({
      title: "Projeto criado",
      description: "Seu projeto foi salvo localmente",
    });
  };

  const deleteProject = (id: string) => {
    // Verificar se há observações associadas a este projeto
    const hasObservations = observations.some(obs => obs.projectId === id);
    
    if (hasObservations) {
      toast({
        title: "Não foi possível excluir",
        description: "Este projeto possui observações associadas. Exclua as observações primeiro.",
        variant: "destructive",
      });
      return;
    }
    
    setProjects((prev) => prev.filter((proj) => proj.id !== id));
    
    if (currentProject?.id === id) {
      setCurrentProject(null);
    }
    
    toast({
      title: "Projeto excluído",
      description: "O projeto foi removido",
    });
  };

  const updateProject = (id: string, updated: Partial<ProjectType>) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === id) {
          const updatedProj = { ...proj, ...updated, updatedAt: Date.now() };
          
          // Atualizar o projeto atual se for o que está sendo editado
          if (currentProject?.id === id) {
            setCurrentProject(updatedProj);
          }
          
          return updatedProj;
        }
        return proj;
      })
    );
    toast({
      title: "Projeto atualizado",
      description: "Suas alterações foram salvas",
    });
  };

  const exportData = (format: "excel" | "json") => {
    try {
      if (!currentProject) {
        toast({
          title: "Erro na exportação",
          description: "Selecione um projeto para exportar dados",
          variant: "destructive",
        });
        return;
      }

      const projectObservations = observations.filter(
        (obs) => obs.projectId === currentProject.id
      );

      if (projectObservations.length === 0) {
        toast({
          title: "Sem dados para exportar",
          description: "Não há observações neste projeto para exportar",
          variant: "destructive",
        });
        return;
      }

      if (format === "excel") {
        // Preparar dados para Excel
        const exportData = projectObservations.map((obs) => ({
          ID: obs.id,
          Data: new Date(obs.date).toLocaleDateString(),
          Espécie: obs.species,
          Localização: obs.location,
          Latitude: obs.coordinates.latitude,
          Longitude: obs.coordinates.longitude,
          Habitat: obs.habitat || "",
          Clima: obs.weather || "",
          Notas: obs.notes || "",
          Tags: obs.tags ? obs.tags.join(", ") : ""
        }));

        // Criar planilha
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Observações");

        // Definir nome do arquivo
        const fileName = `${currentProject.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
        
        // Salvar arquivo
        XLSX.writeFile(workbook, fileName);
        
        toast({
          title: "Exportação concluída",
          description: `Dados exportados como Excel`,
        });
      } else {
        // JSON format
        const content = JSON.stringify(projectObservations, null, 2);
        const fileName = `${currentProject.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`;
        const mimeType = "application/json;charset=utf-8;";

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
          title: "Exportação concluída",
          description: `Dados exportados como JSON`,
        });
      }
    } catch (error) {
      console.error("Falha na exportação:", error);
      toast({
        title: "Falha na exportação",
        description: "Ocorreu um erro ao exportar seus dados",
        variant: "destructive",
      });
    }
  };

  return (
    <DataContext.Provider
      value={{
        observations,
        projects,
        currentProject,
        setCurrentProject,
        addObservation,
        deleteObservation,
        updateObservation,
        addProject,
        deleteProject,
        updateProject,
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
