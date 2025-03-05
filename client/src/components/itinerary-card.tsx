import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { type Itinerary, type Activity } from "@shared/schema";
import { Share, Bed, MapPin, Calendar } from "lucide-react";

interface ItineraryCardProps {
  itinerary: Itinerary;
}

export default function ItineraryCard({ itinerary }: ItineraryCardProps) {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">{itinerary.location}</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <p>From: {itinerary.fromLocation}</p>
            <Calendar className="h-4 w-4 ml-2" />
            <p>{new Date(itinerary.startDate).toLocaleDateString()}</p>
          </div>
          <p className="text-muted-foreground mt-1">
            {itinerary.duration} day itinerary
          </p>
        </div>
        <button
          onClick={handleShare}
          className="p-2 hover:bg-accent rounded-full"
          title="Copy share link"
        >
          <Share className="h-5 w-5" />
        </button>
      </CardHeader>
      <CardContent>
        {/* Accommodation Section */}
        {itinerary.plan.accommodation && (
          <div className="mb-6 border-b pb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Recommended Accommodations
            </h3>
            <div className="grid gap-4">
              {itinerary.plan.accommodation.map((place, index) => (
                <div key={index} className="bg-accent/10 p-4 rounded-lg">
                  <h4 className="font-medium">{place.name}</h4>
                  <p className="text-sm text-muted-foreground">Type: {place.type}</p>
                  <p className="text-sm text-muted-foreground">Price: {place.priceRange}</p>
                  <p className="text-sm text-muted-foreground">Availability: {place.availability}</p>
                  {place.rating && (
                    <p className="text-sm text-muted-foreground">Rating: {place.rating}</p>
                  )}
                  {place.bookingUrl && (
                    <a
                      href={place.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-2 inline-block"
                    >
                      Book Now
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Plans */}
        <Accordion type="single" collapsible>
          {itinerary.plan.dailyPlans.map((day, index) => (
            <AccordionItem key={index} value={`day-${index + 1}`}>
              <AccordionTrigger>Day {day.day}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {day.activities.map((activity: Activity, actIndex) => (
                    <div key={actIndex} className="border-l-2 border-primary pl-4">
                      <p className="font-medium">{activity.time}</p>
                      <p>{activity.activity}</p>
                      <p className="text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {activity.location}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Est. Cost: {activity.estimatedCost}
                      </p>
                      {activity.notes && (
                        <p className="text-sm italic mt-1">{activity.notes}</p>
                      )}
                      {activity.bookingInfo && (
                        <div className="mt-2 text-sm">
                          <p>Availability: {activity.bookingInfo.availability}</p>
                          <p>Price: {activity.bookingInfo.price}</p>
                          {activity.bookingInfo.bookingUrl && (
                            <a
                              href={activity.bookingInfo.bookingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Book Activity
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-6 space-y-4">
          <div>
            <h3 className="font-semibold">Estimated Total Cost</h3>
            <p>{itinerary.plan.estimatedTotalCost}</p>
          </div>

          <div>
            <h3 className="font-semibold">Best Time to Visit</h3>
            <p>{itinerary.plan.bestTimeToVisit}</p>
          </div>

          <div>
            <h3 className="font-semibold">Travel Tips</h3>
            <ul className="list-disc list-inside">
              {itinerary.plan.travelTips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}