import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { type Itinerary } from "@shared/schema";
import LoadingState from "@/components/loading-state";
import ItineraryCard from "@/components/itinerary-card";
import DestinationImages from "@/components/DestinationImages";
import { motion } from "framer-motion";

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
      <div className="container mx-auto px-4 py-8 sm:py-16 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-red-500">Itinerary not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 sm:space-y-12"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            {itinerary.duration}-Day Trip to {itinerary.location}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Starting from {new Date(itinerary.startDate).toLocaleDateString()}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="aspect-video sm:aspect-[21/9] rounded-lg overflow-hidden shadow-lg"
        >
          <DestinationImages destination={itinerary.location} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ItineraryCard itinerary={itinerary} />
        </motion.div>
      </motion.div>
    </div>
  );
}