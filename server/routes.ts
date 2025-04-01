import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateItinerary, generatePlaceDetails } from "./lib/gemini"; // Import new function
import { searchSchema } from "@shared/schema";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/generate", async (req, res) => {
    try {
      const validatedData = searchSchema.parse(req.body);
      const plan = await generateItinerary(
        validatedData.fromLocation,
        validatedData.location,
        validatedData.startDate,
        validatedData.duration
      );

      const shareId = nanoid(10);
      const itinerary = await storage.createItinerary({
        location: validatedData.location,
        fromLocation: validatedData.fromLocation,
        startDate: validatedData.startDate,
        duration: validatedData.duration,
        plan,
        shareId
      });

      res.json(itinerary);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/itinerary/:shareId", async (req, res) => {
    try {
      const itinerary = await storage.getItineraryByShareId(req.params.shareId);
      if (!itinerary) {
        return res.status(404).json({ message: "Itinerary not found" });
      }
      res.json(itinerary);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  // --- New Endpoint for Place Details ---
  app.post("/api/place-details", async (req, res) => {
    try {
      const { placeQuery } = req.body; // Expecting { "placeQuery": "Place Name, Location..." }
      if (!placeQuery || typeof placeQuery !== 'string') {
        return res.status(400).json({ message: "Missing or invalid 'placeQuery' in request body" });
      }

      const details = await generatePlaceDetails(placeQuery);
      res.json({ details }); // Send back as { "details": "..." }

    } catch (error) {
      console.error("Place details endpoint error:", error);
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error fetching place details" });
      }
    }
  });

  return httpServer;
}