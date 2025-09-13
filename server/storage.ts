import { 
  type Company, 
  type Contact, 
  type Deal, 
  type Activity,
  type InsertCompany,
  type InsertContact,
  type InsertDeal,
  type InsertActivity,
  type DealWithRelations,
  type ContactWithCompany,
  type ActivityWithRelations,
  DealStage
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Companies
  getCompanies(): Promise<Company[]>;
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: string): Promise<boolean>;

  // Contacts
  getContacts(): Promise<ContactWithCompany[]>;
  getContact(id: string): Promise<Contact | undefined>;
  getContactsByCompany(companyId: string): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: string): Promise<boolean>;

  // Deals
  getDeals(): Promise<DealWithRelations[]>;
  getDeal(id: string): Promise<DealWithRelations | undefined>;
  getDealsByStage(stage: string): Promise<DealWithRelations[]>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: string, deal: Partial<InsertDeal>): Promise<Deal | undefined>;
  deleteDeal(id: string): Promise<boolean>;

  // Activities
  getActivities(): Promise<ActivityWithRelations[]>;
  getActivity(id: string): Promise<Activity | undefined>;
  getActivitiesByDeal(dealId: string): Promise<ActivityWithRelations[]>;
  getActivitiesByContact(contactId: string): Promise<ActivityWithRelations[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: string, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: string): Promise<boolean>;

  // Analytics
  getMetrics(): Promise<{
    pipelineValue: number;
    conversionRate: number;
    avgDealSize: number;
    salesVelocity: number;
  }>;
}

export class MemStorage implements IStorage {
  private companies: Map<string, Company> = new Map();
  private contacts: Map<string, Contact> = new Map();
  private deals: Map<string, Deal> = new Map();
  private activities: Map<string, Activity> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed companies
    const sampleCompanies: Company[] = [
      { id: "1", name: "TechCorp Inc.", website: "https://techcorp.com", industry: "Technology", size: "51-200", description: "Leading tech solutions provider", createdAt: new Date() },
      { id: "2", name: "DataFlow Systems", website: "https://dataflow.com", industry: "Software", size: "11-50", description: "Data analytics platform", createdAt: new Date() },
      { id: "3", name: "CloudStart Solutions", website: "https://cloudstart.com", industry: "Cloud Services", size: "201-500", description: "Cloud infrastructure provider", createdAt: new Date() },
      { id: "4", name: "InnovateLabs", website: "https://innovatelabs.com", industry: "R&D", size: "1-10", description: "Innovation and research lab", createdAt: new Date() },
      { id: "5", name: "GlobalTech Ltd.", website: "https://globaltech.com", industry: "Technology", size: "500+", description: "Global technology conglomerate", createdAt: new Date() },
    ];

    // Seed contacts
    const sampleContacts: Contact[] = [
      { id: "1", firstName: "Sarah", lastName: "Johnson", email: "sarah@techcorp.com", phone: "+1-555-0101", title: "VP of Sales", companyId: "1", linkedIn: "https://linkedin.com/in/sarah-johnson", notes: "Key decision maker", createdAt: new Date() },
      { id: "2", firstName: "Mike", lastName: "Chen", email: "mike@dataflow.com", phone: "+1-555-0102", title: "CTO", companyId: "2", linkedIn: "https://linkedin.com/in/mike-chen", notes: "Technical lead", createdAt: new Date() },
      { id: "3", firstName: "Emily", lastName: "Rodriguez", email: "emily@cloudstart.com", phone: "+1-555-0103", title: "CEO", companyId: "3", linkedIn: "https://linkedin.com/in/emily-rodriguez", notes: "Final approver", createdAt: new Date() },
      { id: "4", firstName: "David", lastName: "Park", email: "david@innovatelabs.com", phone: "+1-555-0104", title: "Founder", companyId: "4", linkedIn: "https://linkedin.com/in/david-park", notes: "Innovation focused", createdAt: new Date() },
      { id: "5", firstName: "Lisa", lastName: "Wilson", email: "lisa@globaltech.com", phone: "+1-555-0105", title: "Director of Procurement", companyId: "5", linkedIn: "https://linkedin.com/in/lisa-wilson", notes: "Budget holder", createdAt: new Date() },
    ];

    // Seed deals
    const sampleDeals: Deal[] = [
      { id: "1", title: "Enterprise Software License", value: "125000.00", stage: DealStage.NEGOTIATION, probability: 85, expectedCloseDate: new Date('2024-01-15'), actualCloseDate: null, companyId: "1", contactId: "1", notes: "Large enterprise deal", createdAt: new Date(), updatedAt: new Date() },
      { id: "2", title: "Analytics Platform Implementation", value: "89500.00", stage: DealStage.PROPOSAL, probability: 72, expectedCloseDate: new Date('2024-01-20'), actualCloseDate: null, companyId: "2", contactId: "2", notes: "Complex technical requirements", createdAt: new Date(), updatedAt: new Date() },
      { id: "3", title: "Cloud Migration Services", value: "67200.00", stage: DealStage.CLOSED_WON, probability: 100, expectedCloseDate: new Date('2023-12-15'), actualCloseDate: new Date('2023-12-10'), companyId: "3", contactId: "3", notes: "Successfully closed", createdAt: new Date(), updatedAt: new Date() },
      { id: "4", title: "Innovation Consulting", value: "52800.00", stage: DealStage.QUALIFIED, probability: 45, expectedCloseDate: new Date('2024-02-01'), actualCloseDate: null, companyId: "4", contactId: "4", notes: "Good fit for services", createdAt: new Date(), updatedAt: new Date() },
      { id: "5", title: "Global IT Infrastructure", value: "234000.00", stage: DealStage.LEAD, probability: 25, expectedCloseDate: new Date('2024-03-01'), actualCloseDate: null, companyId: "5", contactId: "5", notes: "Initial discussions", createdAt: new Date(), updatedAt: new Date() },
    ];

    // Seed activities
    const sampleActivities: Activity[] = [
      { id: "1", type: "call", title: "Discovery Call", description: "Initial needs assessment call", dealId: "1", contactId: "1", companyId: "1", completed: true, dueDate: null, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { id: "2", type: "email", title: "Proposal Follow-up", description: "Following up on sent proposal", dealId: "2", contactId: "2", companyId: "2", completed: true, dueDate: null, createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
      { id: "3", type: "meeting", title: "Contract Signing", description: "Final contract signing meeting", dealId: "3", contactId: "3", companyId: "3", completed: true, dueDate: null, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      { id: "4", type: "call", title: "Technical Discussion", description: "Discussing technical requirements", dealId: "4", contactId: "4", companyId: "4", completed: false, dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) },
    ];

    sampleCompanies.forEach(company => this.companies.set(company.id, company));
    sampleContacts.forEach(contact => this.contacts.set(contact.id, contact));
    sampleDeals.forEach(deal => this.deals.set(deal.id, deal));
    sampleActivities.forEach(activity => this.activities.set(activity.id, activity));
  }

  // Companies
  async getCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }

  async getCompany(id: string): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const id = randomUUID();
    const newCompany: Company = { 
      ...company,
      website: company.website ?? null,
      industry: company.industry ?? null,
      size: company.size ?? null,
      description: company.description ?? null,
      id, 
      createdAt: new Date() 
    };
    this.companies.set(id, newCompany);
    return newCompany;
  }

  async updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined> {
    const existing = this.companies.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...company };
    this.companies.set(id, updated);
    return updated;
  }

  async deleteCompany(id: string): Promise<boolean> {
    return this.companies.delete(id);
  }

  // Contacts
  async getContacts(): Promise<ContactWithCompany[]> {
    const contacts = Array.from(this.contacts.values());
    return contacts.map(contact => ({
      ...contact,
      company: contact.companyId ? this.companies.get(contact.companyId) : undefined
    }));
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async getContactsByCompany(companyId: string): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(contact => contact.companyId === companyId);
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const newContact: Contact = { 
      ...contact,
      phone: contact.phone ?? null,
      title: contact.title ?? null,
      companyId: contact.companyId ?? null,
      linkedIn: contact.linkedIn ?? null,
      notes: contact.notes ?? null,
      id, 
      createdAt: new Date() 
    };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact | undefined> {
    const existing = this.contacts.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...contact };
    this.contacts.set(id, updated);
    return updated;
  }

  async deleteContact(id: string): Promise<boolean> {
    return this.contacts.delete(id);
  }

  // Deals
  async getDeals(): Promise<DealWithRelations[]> {
    const deals = Array.from(this.deals.values());
    return deals.map(deal => {
      const company = this.companies.get(deal.companyId);
      const contact = this.contacts.get(deal.contactId);
      return {
        ...deal,
        company: company!,
        contact: contact!
      };
    }).filter(deal => deal.company && deal.contact);
  }

  async getDeal(id: string): Promise<DealWithRelations | undefined> {
    const deal = this.deals.get(id);
    if (!deal) return undefined;

    const company = this.companies.get(deal.companyId);
    const contact = this.contacts.get(deal.contactId);
    
    if (!company || !contact) return undefined;

    return {
      ...deal,
      company,
      contact
    };
  }

  async getDealsByStage(stage: string): Promise<DealWithRelations[]> {
    const deals = await this.getDeals();
    return deals.filter(deal => deal.stage === stage);
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const id = randomUUID();
    const now = new Date();
    const newDeal: Deal = { 
      ...deal,
      probability: deal.probability ?? 25,
      expectedCloseDate: deal.expectedCloseDate ?? null,
      actualCloseDate: deal.actualCloseDate ?? null,
      notes: deal.notes ?? null,
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.deals.set(id, newDeal);
    return newDeal;
  }

  async updateDeal(id: string, deal: Partial<InsertDeal>): Promise<Deal | undefined> {
    const existing = this.deals.get(id);
    if (!existing) return undefined;
    
    const updated = { 
      ...existing, 
      ...deal, 
      updatedAt: new Date() 
    };
    this.deals.set(id, updated);
    return updated;
  }

  async deleteDeal(id: string): Promise<boolean> {
    return this.deals.delete(id);
  }

  // Activities
  async getActivities(): Promise<ActivityWithRelations[]> {
    const activities = Array.from(this.activities.values());
    return activities.map(activity => ({
      ...activity,
      deal: activity.dealId ? this.deals.get(activity.dealId) : undefined,
      contact: activity.contactId ? this.contacts.get(activity.contactId) : undefined,
      company: activity.companyId ? this.companies.get(activity.companyId) : undefined,
    }));
  }

  async getActivity(id: string): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async getActivitiesByDeal(dealId: string): Promise<ActivityWithRelations[]> {
    const activities = await this.getActivities();
    return activities.filter(activity => activity.dealId === dealId);
  }

  async getActivitiesByContact(contactId: string): Promise<ActivityWithRelations[]> {
    const activities = await this.getActivities();
    return activities.filter(activity => activity.contactId === contactId);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const newActivity: Activity = { 
      ...activity,
      description: activity.description ?? null,
      dealId: activity.dealId ?? null,
      contactId: activity.contactId ?? null,
      companyId: activity.companyId ?? null,
      completed: activity.completed ?? false,
      dueDate: activity.dueDate ?? null,
      id, 
      createdAt: new Date() 
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  async updateActivity(id: string, activity: Partial<InsertActivity>): Promise<Activity | undefined> {
    const existing = this.activities.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...activity };
    this.activities.set(id, updated);
    return updated;
  }

  async deleteActivity(id: string): Promise<boolean> {
    return this.activities.delete(id);
  }

  // Analytics
  async getMetrics(): Promise<{
    pipelineValue: number;
    conversionRate: number;
    avgDealSize: number;
    salesVelocity: number;
  }> {
    const deals = Array.from(this.deals.values());
    
    // Pipeline value (all open deals)
    const openDeals = deals.filter(deal => !deal.stage.includes('closed'));
    const pipelineValue = openDeals.reduce((sum, deal) => sum + parseFloat(deal.value), 0);
    
    // Conversion rate (closed won / total closed)
    const closedDeals = deals.filter(deal => deal.stage.includes('closed'));
    const wonDeals = deals.filter(deal => deal.stage === 'closed_won');
    const conversionRate = closedDeals.length > 0 ? (wonDeals.length / closedDeals.length) * 100 : 0;
    
    // Average deal size (all deals)
    const avgDealSize = deals.length > 0 ? deals.reduce((sum, deal) => sum + parseFloat(deal.value), 0) / deals.length : 0;
    
    // Sales velocity (average days from creation to close for won deals)
    const salesVelocity = wonDeals.length > 0 ? 
      wonDeals.reduce((sum, deal) => {
        if (deal.actualCloseDate) {
          const days = Math.ceil((deal.actualCloseDate.getTime() - deal.createdAt.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }
        return sum;
      }, 0) / wonDeals.length : 0;

    return {
      pipelineValue,
      conversionRate,
      avgDealSize,
      salesVelocity
    };
  }
}

export const storage = new MemStorage();
