import { GoogleGenerativeAI } from "@google/generative-ai";
import { type Plan } from "@shared/schema";
import { z } from "zod";

const genAI = new GoogleGenerativeAI("AIzaSyACuSIis8DfUIn3XmfhJq0YBPVw30S9H_Y");
function generatePrompt(
  fromLocation: string,
  location: string,
  startDate: Date,
  duration: number,
  budget?: number // Add optional budget parameter
): string {
  const budgetConstraint = budget ? ` The total estimated cost for activities, accommodation, and local transport should strictly adhere to a budget of ₹${budget}. Ensure recommendations are within this limit.` : "";
  return `Create a detailed ${duration}-day travel itinerary from ${fromLocation} to ${location} starting on ${startDate.toLocaleDateString()}. ${budgetConstraint} Include:


1. A day-by-day schedule with:
   - Activities and attractions with time slots
   - Location details
   - Estimated costs
   - Booking information when available

2. Accommodation suggestions with:
   - Hotel/lodging names
   - Price ranges
   - Availability
   - Booking links if possible

3. Additional information:
   - Total estimated cost
   - Best time to visit
   - Travel tips
   - Estimated travel time between locations

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
  duration: number,
  budget?: number // Add optional budget parameter
): Promise<Plan> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Pass budget to prompt generator
    const prompt = generatePrompt(fromLocation, location, startDate, duration, budget);

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
// --- Function to generate details for a specific place ---
export async function generatePlaceDetails(placeQuery: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Simple prompt for concise details
    const prompt = `Provide a concise description (around 50-100 words) for the place: "${placeQuery}". Focus on key highlights, significance, or what visitors can expect. Respond with only the description text, no extra formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Basic cleanup (optional, Gemini might return clean text)
    const cleanedText = text.trim();

    return cleanedText;
  } catch (error) {
    console.error(`Error generating details for "${placeQuery}":`, error);
    throw new Error(`Failed to get details for ${placeQuery}.`);
  }
}
