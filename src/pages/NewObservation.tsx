
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { useData } from "@/context/DataContext";
import { FormValues, Coordinates, ImageData, ObservationType } from "@/types/types";
import { getCurrentLocation, getLocationName } from "@/utils/location";
import { processImageFiles } from "@/utils/images";
import { Loader2, MapPin, Camera, AlertCircle } from "lucide-react";

const formSchema = z.object({
  species: z.string().min(2, "Nome da espécie é obrigatório"),
  habitat: z.string().optional(),
  weather: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  location: z.string().optional(),
});

const NewObservation = () => {
  const navigate = useNavigate();
  const { addObservation, projects, currentProject, setCurrentProject } = useData();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      species: "",
      habitat: "",
      weather: "",
      notes: "",
      tags: "",
      location: "",
    },
  });

  // Redirecionar para projetos se não houver projetos
  useEffect(() => {
    if (projects.length === 0) {
      toast({
        title: "Nenhum projeto encontrado",
        description: "Crie um projeto primeiro para adicionar observações",
      });
      navigate("/projects");
    }
  }, [projects, navigate]);

  // Tentar obter a localização quando o componente é montado
  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);
    try {
      const coords = await getCurrentLocation();
      setCoordinates(coords);
      
      // Tentar obter um nome de localização legível
      try {
        const locationName = await getLocationName(coords);
        setValue("location", locationName);
      } catch (error) {
        console.error("Failed to get location name:", error);
        setValue("location", `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
      }
    } catch (error) {
      console.error("Geolocation error:", error);
      setLocationError("Falha ao obter sua localização. Por favor, insira manualmente ou tente novamente.");
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    try {
      const processedImages = await processImageFiles(event.target.files);
      setImages((prev) => [...prev, ...processedImages]);
      toast({
        title: "Imagens adicionadas",
        description: `Adicionadas ${processedImages.length} imagens`,
      });
    } catch (error) {
      console.error("Failed to process images:", error);
      toast({
        title: "Erro",
        description: "Falha ao processar imagens",
        variant: "destructive",
      });
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const onSubmit = async (data: FormValues) => {
    if (!coordinates) {
      toast({
        title: "Erro",
        description: "Dados de localização são obrigatórios. Por favor, tente novamente ou insira coordenadas manualmente.",
        variant: "destructive",
      });
      return;
    }

    if (!currentProject) {
      toast({
        title: "Erro",
        description: "Selecione um projeto para adicionar esta observação",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newObservation: ObservationType = {
        id: Date.now().toString(),
        projectId: currentProject.id,
        date: new Date().toISOString(),
        species: data.species,
        location: data.location || "Localização desconhecida",
        coordinates,
        images,
        habitat: data.habitat || undefined,
        weather: data.weather || undefined,
        notes: data.notes || undefined,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : undefined,
        createdAt: Date.now(),
      };

      addObservation(newObservation);
      navigate("/observations");
    } catch (error) {
      console.error("Failed to save observation:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar observação",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectChange = (projectId: string) => {
    const selectedProject = projects.find(project => project.id === projectId);
    if (selectedProject) {
      setCurrentProject(selectedProject);
    }
  };

  return (
    <div className="space-y-6 page-transition pb-20">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Nova Observação</h1>
        <p className="text-muted-foreground mt-1">Registre uma nova observação de biodiversidade</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Projeto</CardTitle>
            <CardDescription>Selecione o projeto para esta observação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="project">Projeto <span className="text-destructive">*</span></Label>
              <Select 
                value={currentProject?.id || ""} 
                onValueChange={handleProjectChange}
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Selecionar projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!currentProject && (
                <p className="text-sm text-destructive">É necessário selecionar um projeto</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Insira os detalhes da espécie e localização</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="species">Nome da Espécie <span className="text-destructive">*</span></Label>
              <Input
                id="species"
                placeholder="Digite o nome da espécie"
                {...register("species")}
              />
              {errors.species && (
                <p className="text-sm text-destructive">{errors.species.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="location">Localização</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={fetchLocation}
                  disabled={isGettingLocation}
                  className="h-8"
                >
                  {isGettingLocation ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-2" />
                  )}
                  Obter Localização
                </Button>
              </div>
              <Input
                id="location"
                placeholder="Digite ou use localização atual"
                {...register("location")}
              />
              {locationError && (
                <p className="text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> {locationError}
                </p>
              )}
              {coordinates && (
                <p className="text-xs text-muted-foreground">
                  Latitude: {coordinates.latitude.toFixed(6)}, Longitude: {coordinates.longitude.toFixed(6)}
                  {coordinates.accuracy && ` (Precisão: ±${Math.round(coordinates.accuracy)}m)`}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Imagens</CardTitle>
            <CardDescription>Adicione fotos da espécie ou habitat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="images" className="block mb-2">
                  Upload de Imagens
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("images")?.click()}
                    className="w-full"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Selecionar Imagens
                  </Button>
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {images.length > 0 && (
                <div>
                  <Label className="block mb-2">Pré-visualização</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((image) => (
                      <div 
                        key={image.id} 
                        className="relative rounded-md overflow-hidden aspect-square bg-muted"
                        onClick={() => removeImage(image.id)}
                      >
                        <img
                          src={image.thumbnail || image.url}
                          alt={image.caption || "Imagem da observação"}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-xs font-medium">Toque para remover</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes Adicionais</CardTitle>
            <CardDescription>Adicione condições ambientais e notas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="habitat">Habitat</Label>
                <Input
                  id="habitat"
                  placeholder="Floresta, pântano, etc."
                  {...register("habitat")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weather">Condições Climáticas</Label>
                <Input
                  id="weather"
                  placeholder="Ensolarado, chuvoso, etc."
                  {...register("weather")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Digite observações adicionais"
                {...register("notes")}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Digite tags separadas por vírgulas"
                {...register("tags")}
              />
              <p className="text-xs text-muted-foreground">
                Exemplo: ameaçada, juvenil, floração
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Observação"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default NewObservation;
