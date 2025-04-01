import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the nested schemas for the plan structure
const activitySchema = z.object({
  time: z.string(),
  activity: z.string(),
  location: z.string().optional(), // Location might not always be applicable
  estimatedCost: z.string().optional(), // Cost might not always be available/relevant
  notes: z.string().optional(),
  bookingInfo: z.object({
    availability: z.string().optional(), // Make booking details optional
    price: z.string().optional(),
    bookingUrl: z.string().optional()
  }).optional().nullable() // Allow null as well
});

const dailyPlanSchema = z.object({
  day: z.number(),
  activities: z.array(activitySchema)
});

export const planSchema = z.object({
  dailyPlans: z.array(dailyPlanSchema),
  estimatedTotalCost: z.string().optional(), // Make optional
  bestTimeToVisit: z.string().optional(), // Make optional
  travelTips: z.array(z.string()).optional(), // Make optional
  accommodation: z.array(z.object({
    name: z.string(),
    type: z.string(),
    priceRange: z.string().optional(), // Make optional
    availability: z.string().optional(), // Make optional
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
  startDate: z.coerce.date({ required_error: "Start date is required" }), // Add required error
  duration: z.number().min(1).max(14),
  budget: z.number().positive("Budget must be a positive number").optional(), // Add optional budget
});

export type SearchParams = z.infer<typeof searchSchema>;