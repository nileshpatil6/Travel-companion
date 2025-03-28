import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="flex flex-row justify-between items-center bg-primary/5">
        <div>
          <h2 className="text-3xl font-bold text-primary">{itinerary.location}</h2>
          <div className="flex items-center gap-3 text-muted-foreground mt-2">
            <MapPin className="h-5 w-5" />
            <p className="text-lg">From: {itinerary.fromLocation}</p>
            <Calendar className="h-5 w-5 ml-4" />
            <p className="text-lg">{new Date(itinerary.startDate).toLocaleDateString()}</p>
          </div>
          <p className="text-lg text-muted-foreground mt-2">
            {itinerary.duration} day itinerary
          </p>
        </div>
        <button
          onClick={handleShare}
          className="p-2 hover:bg-accent rounded-full transition-colors"
          title="Copy share link"
        >
          <Share className="h-6 w-6" />
        </button>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Accommodation Section */}
        {itinerary.plan.accommodation && (
          <div className="bg-accent/5 p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-primary">
              <Bed className="h-6 w-6" />
              Recommended Accommodations
            </h3>
            <div className="grid gap-4">
              {itinerary.plan.accommodation.map((place, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
                  <h4 className="text-xl font-semibold">{place.name}</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p className="text-base"><span className="font-medium">Type:</span> {place.type}</p>
                    <p className="text-base"><span className="font-medium">Price:</span> {place.priceRange}</p>
                    <p className="text-base"><span className="font-medium">Availability:</span> {place.availability}</p>
                    {place.rating && (
                      <p className="text-base"><span className="font-medium">Rating:</span> {place.rating}</p>
                    )}
                  </div>
                  {place.bookingUrl && (
                    <a
                      href={place.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
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
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-primary mb-4">Daily Itinerary</h3>
          {itinerary.plan.dailyPlans.map((day, index) => (
            <div key={index} className="bg-accent/5 p-6 rounded-lg">
              <h4 className="text-xl font-bold mb-4 text-primary">Day {day.day}</h4>
              <div className="space-y-4">
                {day.activities.map((activity: Activity, actIndex) => (
                  <div key={actIndex} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-primary">
                    <p className="text-lg font-semibold text-primary">{activity.time}</p>
                    <p className="text-lg mt-1">{activity.activity}</p>
                    <div className="flex items-center gap-2 mt-2 text-base text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <p>{activity.location}</p>
                    </div>
                    <p className="text-base font-medium mt-2">
                      Est. Cost: <span className="text-primary">{activity.estimatedCost}</span>
                    </p>
                    {activity.notes && (
                      <p className="text-base italic mt-2 bg-accent/10 p-2 rounded">{activity.notes}</p>
                    )}
                    {activity.bookingInfo && (
                      <div className="mt-3 p-3 bg-accent/10 rounded">
                        <p className="text-base"><span className="font-medium">Availability:</span> {activity.bookingInfo.availability}</p>
                        <p className="text-base"><span className="font-medium">Price:</span> {activity.bookingInfo.price}</p>
                        {activity.bookingInfo.bookingUrl && (
                          <a
                            href={activity.bookingInfo.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                          >
                            Book Activity
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-accent/5 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-primary mb-3">Estimated Total Cost</h3>
            <p className="text-lg">{itinerary.plan.estimatedTotalCost}</p>
          </div>

          <div className="bg-accent/5 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-primary mb-3">Best Time to Visit</h3>
            <p className="text-lg">{itinerary.plan.bestTimeToVisit}</p>
          </div>

          <div className="md:col-span-2 bg-accent/5 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-primary mb-3">Travel Tips</h3>
            <ul className="space-y-2">
              {itinerary.plan.travelTips.map((tip, index) => (
                <li key={index} className="text-lg flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}