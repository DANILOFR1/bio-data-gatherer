
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { ObservationType, FormValues } from "@/types/types";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  species: z.string().min(2, "Nome da espécie é obrigatório"),
  habitat: z.string().optional(),
  weather: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  location: z.string().optional(),
});

interface EditObservationDialogProps {
  observation: ObservationType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, data: Partial<ObservationType>) => void;
}

export function EditObservationDialog({ observation, open, onOpenChange, onSave }: EditObservationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      species: observation?.species || "",
      habitat: observation?.habitat || "",
      weather: observation?.weather || "",
      notes: observation?.notes || "",
      tags: observation?.tags?.join(", ") || "",
      location: observation?.location || "",
    },
  });

  // Reset form when observation changes
  React.useEffect(() => {
    if (observation) {
      reset({
        species: observation.species,
        habitat: observation.habitat || "",
        weather: observation.weather || "",
        notes: observation.notes || "",
        tags: observation.tags?.join(", ") || "",
        location: observation.location,
      });
    }
  }, [observation, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!observation) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedData: Partial<ObservationType> = {
        species: data.species,
        location: data.location || observation.location,
        habitat: data.habitat || undefined,
        weather: data.weather || undefined,
        notes: data.notes || undefined,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : undefined,
      };
      
      onSave(observation.id, updatedData);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update observation:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar a observação",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Observação</DialogTitle>
          <DialogDescription>
            Faça alterações na sua observação. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        
        {observation && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                placeholder="Localização"
                {...register("location")}
              />
            </div>

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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
