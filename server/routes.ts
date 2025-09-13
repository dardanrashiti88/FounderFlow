import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCompanySchema, insertContactSchema, insertDealSchema, insertActivitySchema } from "@shared/schema";
import { ZodError } from "zod";
import { register, httpRequestsTotal, httpRequestDuration, totalDeals, pipelineValue, conversionRate } from "./metrics";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Docker/Kubernetes
  app.get("/health", (req, res) => {
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime() 
    });
  });

  // Prometheus metrics endpoint
  app.get("/metrics", async (req, res) => {
    try {
      // Update business metrics before scraping
      const deals = await storage.getDeals();
      const metrics = await storage.getMetrics();
      
      // Update deal counts by stage
      const dealsByStage = deals.reduce((acc, deal) => {
        acc[deal.stage] = (acc[deal.stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(dealsByStage).forEach(([stage, count]) => {
        totalDeals.set({ stage }, count);
      });
      
      pipelineValue.set(metrics.pipelineValue);
      conversionRate.set(metrics.conversionRate);
      
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Companies
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const data = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(data);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.put("/api/companies/:id", async (req, res) => {
    try {
      const data = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(req.params.id, data);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  app.delete("/api/companies/:id", async (req, res) => {
    try {
      const success = await storage.deleteCompany(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  // Contacts
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.get("/api/contacts/:id", async (req, res) => {
    try {
      const contact = await storage.getContact(req.params.id);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const data = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(data);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  app.put("/api/contacts/:id", async (req, res) => {
    try {
      const data = insertContactSchema.partial().parse(req.body);
      const contact = await storage.updateContact(req.params.id, data);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const success = await storage.deleteContact(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // Deals
  app.get("/api/deals", async (req, res) => {
    try {
      const { stage } = req.query;
      let deals;
      if (stage && typeof stage === 'string') {
        deals = await storage.getDealsByStage(stage);
      } else {
        deals = await storage.getDeals();
      }
      res.json(deals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  app.get("/api/deals/:id", async (req, res) => {
    try {
      const deal = await storage.getDeal(req.params.id);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      res.json(deal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deal" });
    }
  });

  app.post("/api/deals", async (req, res) => {
    try {
      const data = insertDealSchema.parse(req.body);
      const deal = await storage.createDeal(data);
      res.status(201).json(deal);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create deal" });
    }
  });

  app.put("/api/deals/:id", async (req, res) => {
    try {
      const data = insertDealSchema.partial().parse(req.body);
      const deal = await storage.updateDeal(req.params.id, data);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      res.json(deal);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update deal" });
    }
  });

  app.delete("/api/deals/:id", async (req, res) => {
    try {
      const success = await storage.deleteDeal(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Deal not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete deal" });
    }
  });

  // Activities
  app.get("/api/activities", async (req, res) => {
    try {
      const { dealId, contactId } = req.query;
      let activities;
      
      if (dealId && typeof dealId === 'string') {
        activities = await storage.getActivitiesByDeal(dealId);
      } else if (contactId && typeof contactId === 'string') {
        activities = await storage.getActivitiesByContact(contactId);
      } else {
        activities = await storage.getActivities();
      }
      
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const data = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(data);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  app.put("/api/activities/:id", async (req, res) => {
    try {
      const data = insertActivitySchema.partial().parse(req.body);
      const activity = await storage.updateActivity(req.params.id, data);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      res.json(activity);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update activity" });
    }
  });

  app.delete("/api/activities/:id", async (req, res) => {
    try {
      const success = await storage.deleteActivity(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Activity not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete activity" });
    }
  });

  // Analytics
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Export endpoints
  app.get("/api/export/deals", async (req, res) => {
    try {
      const { format = 'csv', startDate, endDate } = req.query;
      const deals = await storage.getDeals();
      
      let filteredDeals = deals;
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        filteredDeals = deals.filter(deal => 
          deal.createdAt >= start && deal.createdAt <= end
        );
      }

      if (format === 'csv') {
        const csvData = filteredDeals.map(deal => ({
          'Deal ID': deal.id,
          'Title': deal.title,
          'Value': deal.value,
          'Stage': deal.stage,
          'Probability': deal.probability,
          'Company': deal.company.name,
          'Contact': `${deal.contact.firstName} ${deal.contact.lastName}`,
          'Expected Close Date': deal.expectedCloseDate?.toISOString().split('T')[0] || '',
          'Created Date': deal.createdAt.toISOString().split('T')[0]
        }));
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="deals.csv"');
        
        // Simple CSV conversion
        const headers = Object.keys(csvData[0] || {});
        const csv = [
          headers.join(','),
          ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(','))
        ].join('\n');
        
        res.send(csv);
      } else {
        res.json(filteredDeals);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to export deals" });
    }
  });

  app.get("/api/export/contacts", async (req, res) => {
    try {
      const { format = 'csv' } = req.query;
      const contacts = await storage.getContacts();

      if (format === 'csv') {
        const csvData = contacts.map(contact => ({
          'Contact ID': contact.id,
          'First Name': contact.firstName,
          'Last Name': contact.lastName,
          'Email': contact.email,
          'Phone': contact.phone || '',
          'Title': contact.title || '',
          'Company': contact.company?.name || '',
          'LinkedIn': contact.linkedIn || '',
          'Notes': contact.notes || ''
        }));
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
        
        const headers = Object.keys(csvData[0] || {});
        const csv = [
          headers.join(','),
          ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(','))
        ].join('\n');
        
        res.send(csv);
      } else {
        res.json(contacts);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to export contacts" });
    }
  });

  app.get("/api/export/companies", async (req, res) => {
    try {
      const { format = 'csv' } = req.query;
      const companies = await storage.getCompanies();

      if (format === 'csv') {
        const csvData = companies.map(company => ({
          'Company ID': company.id,
          'Name': company.name,
          'Website': company.website || '',
          'Industry': company.industry || '',
          'Size': company.size || '',
          'Description': company.description || ''
        }));
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="companies.csv"');
        
        const headers = Object.keys(csvData[0] || {});
        const csv = [
          headers.join(','),
          ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(','))
        ].join('\n');
        
        res.send(csv);
      } else {
        res.json(companies);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to export companies" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
