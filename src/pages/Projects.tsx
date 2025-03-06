
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { Trash2, FolderOpen, Calendar, ClipboardEdit } from "lucide-react";
import { ProjectType } from "@/types/types";

const Projects = () => {
  const navigate = useNavigate();
  const { projects, addProject, deleteProject, setCurrentProject, observations } = useData();
  const [editingProject, setEditingProject] = useState<ProjectType | null>(null);

  const handleCreateProject = (project: ProjectType) => {
    addProject(project);
  };

  const handleSelectProject = (project: ProjectType) => {
    setCurrentProject(project);
    navigate("/observations");
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getObservationCount = (projectId: string) => {
    return observations.filter(obs => obs.projectId === projectId).length;
  };

  return (
    <div className="space-y-6 page-transition pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus projetos de biodiversidade</p>
        </div>
        <CreateProjectDialog onCreateProject={handleCreateProject} />
      </header>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum projeto encontrado</p>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            Crie um novo projeto para começar a coletar observações
          </p>
          <CreateProjectDialog onCreateProject={handleCreateProject} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{project.name}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  Iniciado em {formatDate(project.startDate)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {project.description && (
                  <p className="text-sm line-clamp-3">{project.description}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {getObservationCount(project.id)} observações
                </p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectProject(project)}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Abrir
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir projeto</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.
                        {getObservationCount(project.id) > 0 && (
                          <p className="font-semibold text-destructive mt-2">
                            Este projeto possui {getObservationCount(project.id)} observações que serão mantidas.
                            Você só pode excluir projetos vazios.
                          </p>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteProject(project.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
