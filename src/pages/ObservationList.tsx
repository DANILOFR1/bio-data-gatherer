
import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ChevronDown, ChevronUp, Search, Calendar, MapPin, Trash2, FilePlus } from "lucide-react";
import { Link } from "react-router-dom";
import { ObservationType } from "@/types/types";

const ObservationList = () => {
  const { observations, deleteObservation, exportData } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof ObservationType>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filteredObservations, setFilteredObservations] = useState<ObservationType[]>([]);
  const [selectedObservation, setSelectedObservation] = useState<ObservationType | null>(null);

  useEffect(() => {
    // Filter and sort observations
    let filtered = [...observations];

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (obs) =>
          obs.species.toLowerCase().includes(term) ||
          obs.location.toLowerCase().includes(term) ||
          obs.notes?.toLowerCase().includes(term) ||
          obs.tags?.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle date comparison for createdAt
      if (sortField === "createdAt") {
        return sortDirection === "asc" 
          ? (a.createdAt || 0) - (b.createdAt || 0)
          : (b.createdAt || 0) - (a.createdAt || 0);
      }

      return 0;
    });

    setFilteredObservations(filtered);
  }, [observations, searchTerm, sortField, sortDirection]);

  const toggleSort = (field: keyof ObservationType) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = (id: string) => {
    deleteObservation(id);
  };

  return (
    <div className="space-y-6 page-transition pb-20">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Observations</h1>
        <p className="text-muted-foreground mt-1">Browse and manage your collected data</p>
      </header>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search species, location, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => toggleSort("createdAt")}
            className="flex items-center"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Date
            {sortField === "createdAt" && (
              <span className="ml-1">
                {sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => toggleSort("species")}
            className="flex items-center"
          >
            Species
            {sortField === "species" && (
              <span className="ml-1">
                {sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </span>
            )}
          </Button>
        </div>
      </div>

      {filteredObservations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No observations found</p>
          <Link to="/new">
            <Button className="mt-4">
              <FilePlus className="mr-2 h-4 w-4" />
              Add Observation
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredObservations.map((observation) => (
            <Card key={observation.id} className="overflow-hidden card-hover">
              <div className="flex flex-col md:flex-row">
                {observation.images.length > 0 && (
                  <div className="md:w-1/4 aspect-square md:aspect-auto bg-muted">
                    <img
                      src={observation.images[0].thumbnail || observation.images[0].url}
                      alt={observation.species}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className={`flex-1 ${observation.images.length > 0 ? "md:w-3/4" : "w-full"}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{observation.species}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {observation.location}
                        </CardDescription>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(observation.createdAt)}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {observation.notes && (
                      <p className="text-sm line-clamp-2">{observation.notes}</p>
                    )}
                    {observation.tags && observation.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {observation.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedObservation(observation)}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{selectedObservation?.species}</DialogTitle>
                          <DialogDescription>
                            Recorded on {selectedObservation && formatDate(selectedObservation.createdAt)}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedObservation && (
                          <div className="space-y-4">
                            {selectedObservation.images.length > 0 && (
                              <div>
                                <Label className="block mb-2">Images</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {selectedObservation.images.map((image) => (
                                    <div key={image.id} className="rounded-md overflow-hidden aspect-square bg-muted">
                                      <img
                                        src={image.url}
                                        alt={image.caption || "Observation image"}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="block mb-1">Location</Label>
                                <p>{selectedObservation.location}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {selectedObservation.coordinates.latitude.toFixed(6)},{" "}
                                  {selectedObservation.coordinates.longitude.toFixed(6)}
                                </p>
                              </div>

                              <div>
                                <Label className="block mb-1">Date & Time</Label>
                                <p>
                                  {new Date(selectedObservation.date).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(selectedObservation.date).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>

                            {(selectedObservation.habitat || selectedObservation.weather) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedObservation.habitat && (
                                  <div>
                                    <Label className="block mb-1">Habitat</Label>
                                    <p>{selectedObservation.habitat}</p>
                                  </div>
                                )}

                                {selectedObservation.weather && (
                                  <div>
                                    <Label className="block mb-1">Weather</Label>
                                    <p>{selectedObservation.weather}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {selectedObservation.notes && (
                              <div>
                                <Label className="block mb-1">Notes</Label>
                                <p className="whitespace-pre-line">{selectedObservation.notes}</p>
                              </div>
                            )}

                            {selectedObservation.tags && selectedObservation.tags.length > 0 && (
                              <div>
                                <Label className="block mb-1">Tags</Label>
                                <div className="flex flex-wrap gap-1">
                                  {selectedObservation.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete observation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this observation? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(observation.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredObservations.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => exportData("csv")}>
            Export {filteredObservations.length} observations
          </Button>
        </div>
      )}
    </div>
  );
};

export default ObservationList;
