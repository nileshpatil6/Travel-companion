import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { type Itinerary } from "@shared/schema";
import LoadingState from "@/components/loading-state";
import ItineraryCard from "@/components/itinerary-card";

export default function ItineraryPage() {
  const { shareId } = useParams();

  const { data: itinerary, isLoading } = useQuery<Itinerary>({
    queryKey: [`/api/itinerary/${shareId}`],
    enabled: !!shareId
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (!itinerary) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-500">Itinerary not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">
        {itinerary.duration}-Day Trip to {itinerary.location}
      </h1>
      <ItineraryCard itinerary={itinerary} />
    </div>
  );
}