import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Header from "@/components/header";
import { ContactWithCompany } from "@shared/schema";
import { Search, Mail, Phone, LinkedinIcon, Building, MoreHorizontal } from "lucide-react";

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: contacts = [], isLoading } = useQuery<ContactWithCompany[]>({
    queryKey: ["/api/contacts"],
  });

  // Filter contacts based on search
  const filteredContacts = contacts.filter((contact) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      contact.firstName.toLowerCase().includes(query) ||
      contact.lastName.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      (contact.company?.name || "").toLowerCase().includes(query) ||
      (contact.title || "").toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <>
        <Header title="Contacts" />
        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted/30 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Contacts" subtitle={`${filteredContacts.length} of ${contacts.length} contacts`} />
      
      <div className="p-6 space-y-6">
        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search contacts by name, email, company, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-contacts"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredContacts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No contacts found matching your search.</p>
              </div>
            ) : (
              <Table data-testid="contacts-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>LinkedIn</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id} data-testid={`contact-row-${contact.id}`}>
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {contact.firstName} {contact.lastName}
                        </div>
                        {contact.notes && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {contact.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {contact.title ? (
                          <Badge variant="secondary">{contact.title}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building size={16} className="text-muted-foreground" />
                          <span>{contact.company?.name || "No company"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a 
                          href={`mailto:${contact.email}`}
                          className="flex items-center space-x-2 text-primary hover:underline"
                        >
                          <Mail size={16} />
                          <span>{contact.email}</span>
                        </a>
                      </TableCell>
                      <TableCell>
                        {contact.phone ? (
                          <a 
                            href={`tel:${contact.phone}`}
                            className="flex items-center space-x-2 text-primary hover:underline"
                          >
                            <Phone size={16} />
                            <span>{contact.phone}</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {contact.linkedIn ? (
                          <a 
                            href={contact.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-primary hover:underline"
                          >
                            <LinkedinIcon size={16} />
                            <span>Profile</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" data-testid={`contact-actions-${contact.id}`}>
                          <MoreHorizontal size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
