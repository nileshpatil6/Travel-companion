import { GoogleGenerativeAI } from "@google/generative-ai";
import { type Plan } from "@shared/schema";
import { z } from "zod";

const genAI = new GoogleGenerativeAI("AIzaSyACuSIis8DfUIn3XmfhJq0YBPVw30S9H_Y");

function generatePrompt(fromLocation: string, location: string, startDate: Date, duration: number, transportationMode: string): string {
  return `Create a detailed ${duration}-day travel itinerary from ${fromLocation} to ${location} starting on ${startDate.toLocaleDateString()}, with ${transportationMode} as the primary mode of transportation. Include:

1. A day-by-day schedule with:
   - Activities and attractions with time slots
   - Location details
   - Estimated costs
   - Booking information when available
   - Transportation details between locations using ${transportationMode}

2. Accommodation suggestions with:
   - Hotel/lodging names
   - Price ranges
   - Availability
   - Booking links if possible

3. Additional information:
   - Total estimated cost (including ${transportationMode} expenses)
   - Best time to visit
   - Travel tips specific to ${transportationMode} travel
   - Estimated travel time between locations using ${transportationMode}

4. Just make plan for the destination not for the start location, ignore the start location its just for user nothing to do for us with it , but ensure to calculate the distance between the start and the destination location , and the prices should be In INDIAN Rupees ₹
Format the response as a structured JSON object. Example structure:
{
  "dailyPlans": [{
    "day": 1,
    "activities": [{
      "time": "9:00 AM",
      "activity": "Visit landmark",
      "location": "Address",
      "estimatedCost": "₹20",
      "bookingInfo": {
        "availability": "Open 9AM-5PM",
        "price": "₹20/person",
        "bookingUrl": "optional-url"
      }
    }]
  }],
  "accommodation": [{
    "name": "Hotel Name",
    "type": "Hotel/Hostel/etc",
    "priceRange": "₹100-150/night",
    "availability": "Available",
    "rating": "4.5/5",
    "bookingUrl": "optional-url"
  }],
  "estimatedTotalCost": "₹500",
  "bestTimeToVisit": "Spring/Summer",
  "travelTips": ["Tip 1", "Tip 2"]
}`;
}

export async function generateItinerary(
  fromLocation: string,
  location: string,
  startDate: Date,
  duration: number
): Promise<Plan> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });

    const prompt = generatePrompt(fromLocation, location, startDate, duration, "car");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from Gemini response");
    }

    // Parse and validate the response
    const json = JSON.parse(jsonMatch[0]);
    return json as Plan;
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw new Error("Failed to generate itinerary. Please try again later.");
  }
}
