
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
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { useData } from "@/context/DataContext";
import { FormValues, Coordinates, ImageData, ObservationType } from "@/types/types";
import { getCurrentLocation, getLocationName } from "@/utils/location";
import { processImageFiles } from "@/utils/images";
import { Loader2, MapPin, Camera, AlertCircle } from "lucide-react";

const formSchema = z.object({
  species: z.string().min(2, "Species name is required"),
  habitat: z.string().optional(),
  weather: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  location: z.string().optional(),
});

const NewObservation = () => {
  const navigate = useNavigate();
  const { addObservation } = useData();
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

  // Try to get location when component mounts
  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);
    try {
      const coords = await getCurrentLocation();
      setCoordinates(coords);
      
      // Try to get a readable location name
      try {
        const locationName = await getLocationName(coords);
        setValue("location", locationName);
      } catch (error) {
        console.error("Failed to get location name:", error);
        setValue("location", `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
      }
    } catch (error) {
      console.error("Geolocation error:", error);
      setLocationError("Failed to get your location. Please enter it manually or try again.");
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
        title: "Images added",
        description: `Added ${processedImages.length} images`,
      });
    } catch (error) {
      console.error("Failed to process images:", error);
      toast({
        title: "Error",
        description: "Failed to process images",
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
        title: "Error",
        description: "Location data is required. Please try again or enter coordinates manually.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newObservation: ObservationType = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        species: data.species,
        location: data.location || "Unknown location",
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
        title: "Error",
        description: "Failed to save observation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 page-transition pb-20">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">New Observation</h1>
        <p className="text-muted-foreground mt-1">Record a new biodiversity observation</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the species and location details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="species">Species Name <span className="text-destructive">*</span></Label>
              <Input
                id="species"
                placeholder="Enter species name"
                {...register("species")}
              />
              {errors.species && (
                <p className="text-sm text-destructive">{errors.species.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="location">Location</Label>
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
                  Get Location
                </Button>
              </div>
              <Input
                id="location"
                placeholder="Enter or use current location"
                {...register("location")}
              />
              {locationError && (
                <p className="text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> {locationError}
                </p>
              )}
              {coordinates && (
                <p className="text-xs text-muted-foreground">
                  Coordinates: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                  {coordinates.accuracy && ` (Accuracy: ±${Math.round(coordinates.accuracy)}m)`}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>Add photos of the species or habitat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="images" className="block mb-2">
                  Upload Images
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("images")?.click()}
                    className="w-full"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Select Images
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
                  <Label className="block mb-2">Preview</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((image) => (
                      <div 
                        key={image.id} 
                        className="relative rounded-md overflow-hidden aspect-square bg-muted"
                        onClick={() => removeImage(image.id)}
                      >
                        <img
                          src={image.thumbnail || image.url}
                          alt={image.caption || "Observation image"}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-xs font-medium">Tap to remove</p>
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
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>Add environmental conditions and notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="habitat">Habitat</Label>
                <Input
                  id="habitat"
                  placeholder="Forest, wetland, etc."
                  {...register("habitat")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weather">Weather Conditions</Label>
                <Input
                  id="weather"
                  placeholder="Sunny, rainy, etc."
                  {...register("weather")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional observations"
                {...register("notes")}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Enter tags separated by commas"
                {...register("tags")}
              />
              <p className="text-xs text-muted-foreground">
                Example: endangered, juvenile, flowering
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Observation"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default NewObservation;
