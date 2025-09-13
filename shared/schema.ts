import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  website: text("website"),
  industry: text("industry"),
  size: text("size"), // "1-10", "11-50", "51-200", "201-500", "500+"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  title: text("title"),
  companyId: varchar("company_id").references(() => companies.id),
  linkedIn: text("linkedin"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deals = pgTable("deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  stage: text("stage").notNull(), // "lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"
  probability: integer("probability").notNull().default(25), // percentage 0-100
  expectedCloseDate: timestamp("expected_close_date"),
  actualCloseDate: timestamp("actual_close_date"),
  companyId: varchar("company_id").references(() => companies.id).notNull(),
  contactId: varchar("contact_id").references(() => contacts.id).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // "call", "email", "meeting", "note", "task"
  title: text("title").notNull(),
  description: text("description"),
  dealId: varchar("deal_id").references(() => deals.id),
  contactId: varchar("contact_id").references(() => contacts.id),
  companyId: varchar("company_id").references(() => companies.id),
  completed: boolean("completed").default(false).notNull(),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Types
export type Company = typeof companies.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type Activity = typeof activities.$inferSelect;

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Extended types for UI
export type DealWithRelations = Deal & {
  company: Company;
  contact: Contact;
};

export type ContactWithCompany = Contact & {
  company?: Company;
};

export type ActivityWithRelations = Activity & {
  deal?: Deal;
  contact?: Contact;
  company?: Company;
};

export const DealStage = {
  LEAD: "lead",
  QUALIFIED: "qualified", 
  PROPOSAL: "proposal",
  NEGOTIATION: "negotiation",
  CLOSED_WON: "closed_won",
  CLOSED_LOST: "closed_lost",
} as const;

export const ActivityType = {
  CALL: "call",
  EMAIL: "email",
  MEETING: "meeting",
  NOTE: "note",
  TASK: "task",
} as const;
