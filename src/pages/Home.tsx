
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { PlusCircle, List, CloudOff, Cloud, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

const Home = () => {
  const navigate = useNavigate();
  const { observations, syncStatus, exportData } = useData();
  const [stats, setStats] = useState({
    totalObservations: 0,
    uniqueSpecies: 0,
    latestObservation: "",
  });

  useEffect(() => {
    const uniqueSpecies = new Set(observations.map(obs => obs.species)).size;
    const latestObservation = observations.length > 0 
      ? new Date(observations[0].createdAt).toLocaleDateString() 
      : "No observations yet";

    setStats({
      totalObservations: observations.length,
      uniqueSpecies,
      latestObservation,
    });
  }, [observations]);

  return (
    <div className="space-y-6 page-transition pb-20">
      <header className="text-center py-6">
        <h1 className="text-3xl font-bold tracking-tight">BioData Gatherer</h1>
        <p className="text-muted-foreground mt-2">Collect and manage biodiversity data with ease</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Button 
          onClick={() => navigate('/new')} 
          className="h-20 text-lg font-medium hover-scale"
          size="lg"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          New Observation
        </Button>
        
        <Button 
          onClick={() => navigate('/observations')} 
          variant="outline" 
          className="h-20 text-lg font-medium hover-scale"
          size="lg"
        >
          <List className="mr-2 h-5 w-5" />
          View Observations
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-4xl font-bold text-center text-primary">
              {stats.totalObservations}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>Total Observations</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-4xl font-bold text-center text-primary">
              {stats.uniqueSpecies}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>Unique Species</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-center text-muted-foreground">
              Latest Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg font-medium">{stats.latestObservation}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export your collected data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center">
            <div className="mr-2">
              {syncStatus === "synced" ? (
                <Cloud className="h-5 w-5 text-primary" />
              ) : (
                <CloudOff className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm">
              {syncStatus === "synced" 
                ? "All data is synced locally" 
                : "Some data may not be synced"}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => exportData("excel")}
            disabled={observations.length === 0}
          >
            <Download className="mr-2 h-4 w-4" /> Export Excel
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => exportData("json")}
            disabled={observations.length === 0}
          >
            <Download className="mr-2 h-4 w-4" /> Export JSON
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Home;
