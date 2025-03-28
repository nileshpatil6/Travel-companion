import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the nested schemas for the plan structure
const activitySchema = z.object({
  time: z.string(),
  activity: z.string(),
  location: z.string(),
  estimatedCost: z.string(),
  notes: z.string().optional(),
  bookingInfo: z.object({
    availability: z.string(),
    price: z.string(),
    bookingUrl: z.string().optional()
  }).optional()
});

const dailyPlanSchema = z.object({
  day: z.number(),
  activities: z.array(activitySchema)
});

export const planSchema = z.object({
  dailyPlans: z.array(dailyPlanSchema),
  estimatedTotalCost: z.string(),
  bestTimeToVisit: z.string(),
  travelTips: z.array(z.string()),
  accommodation: z.array(z.object({
    name: z.string(),
    type: z.string(),
    priceRange: z.string(),
    availability: z.string(),
    rating: z.string().optional(),
    bookingUrl: z.string().optional()
  })).optional()
});

export const itineraries = pgTable("itineraries", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  fromLocation: text("from_location").notNull(),
  startDate: timestamp("start_date").notNull(),
  duration: integer("duration").notNull(),
  plan: jsonb("plan").$type<z.infer<typeof planSchema>>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  shareId: text("share_id").notNull()
});

export const insertItinerarySchema = createInsertSchema(itineraries).omit({
  id: true,
  createdAt: true
});

export type InsertItinerary = z.infer<typeof insertItinerarySchema>;
export type Itinerary = typeof itineraries.$inferSelect;
export type Plan = z.infer<typeof planSchema>;
export type DailyPlan = z.infer<typeof dailyPlanSchema>;
export type Activity = z.infer<typeof activitySchema>;

export const searchSchema = z.object({
  location: z.string().min(1, "Destination is required"),
  fromLocation: z.string().min(1, "Origin location is required"),
  startDate: z.coerce.date(),
  duration: z.number().min(1).max(14),
  transportationMode: z.enum(["car", "train", "bus", "flight", "bike"]).default("car")
});

export type SearchParams = z.infer<typeof searchSchema>;