import { itineraries, type Itinerary, type InsertItinerary } from "@shared/schema";

export interface IStorage {
  createItinerary(itinerary: InsertItinerary): Promise<Itinerary>;
  getItineraryByShareId(shareId: string): Promise<Itinerary | undefined>;
}

export class MemStorage implements IStorage {
  private itineraries: Map<number, Itinerary>;
  private currentId: number;

  constructor() {
    this.itineraries = new Map();
    this.currentId = 1;
  }

  async createItinerary(insertItinerary: InsertItinerary): Promise<Itinerary> {
    const id = this.currentId++;
    const itinerary: Itinerary = {
      ...insertItinerary,
      id,
      createdAt: new Date()
    };
    this.itineraries.set(id, itinerary);
    return itinerary;
  }

  async getItineraryByShareId(shareId: string): Promise<Itinerary | undefined> {
    return Array.from(this.itineraries.values()).find(
      (itinerary) => itinerary.shareId === shareId
    );
  }
}

export const storage = new MemStorage();
