import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDealSchema, Company, ContactWithCompany } from "@shared/schema";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const dealFormSchema = insertDealSchema.extend({
  expectedCloseDate: z.string().optional()
});

type DealFormData = z.infer<typeof dealFormSchema>;

interface NewDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewDealDialog({ open, onOpenChange }: NewDealDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: contacts = [] } = useQuery<ContactWithCompany[]>({
    queryKey: ["/api/contacts"],
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DealFormData>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      stage: "lead",
      probability: 25,
    },
  });

  const selectedCompanyId = watch("companyId");
  const companyContacts = contacts.filter(
    (contact) => contact.companyId === selectedCompanyId
  );

  const createDealMutation = useMutation({
    mutationFn: async (data: DealFormData) => {
      const payload = {
        ...data,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
      };
      const response = await apiRequest("POST", "/api/deals", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({
        title: "Success",
        description: "Deal created successfully",
      });
      reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create deal",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DealFormData) => {
    createDealMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="new-deal-dialog">
        <DialogHeader>
          <DialogTitle>Create New Deal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Deal Name</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter deal name"
                data-testid="input-deal-title"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="value">Deal Value</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                {...register("value")}
                placeholder="0.00"
                data-testid="input-deal-value"
              />
              {errors.value && (
                <p className="text-sm text-destructive">{errors.value.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyId">Company</Label>
              <Select 
                onValueChange={(value) => setValue("companyId", value)}
                data-testid="select-company"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.companyId && (
                <p className="text-sm text-destructive">{errors.companyId.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="contactId">Contact</Label>
              <Select 
                onValueChange={(value) => setValue("contactId", value)}
                disabled={!selectedCompanyId}
                data-testid="select-contact"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  {companyContacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.contactId && (
                <p className="text-sm text-destructive">{errors.contactId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="stage">Stage</Label>
              <Select 
                onValueChange={(value) => setValue("stage", value)}
                defaultValue="lead"
                data-testid="select-stage"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed_won">Closed Won</SelectItem>
                  <SelectItem value="closed_lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="probability">Probability (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                {...register("probability", { valueAsNumber: true })}
                placeholder="25"
                data-testid="input-probability"
              />
            </div>
            <div>
              <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
              <Input
                id="expectedCloseDate"
                type="date"
                {...register("expectedCloseDate")}
                data-testid="input-close-date"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Add any notes about this deal..."
              rows={3}
              data-testid="textarea-notes"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createDealMutation.isPending}
              data-testid="button-create"
            >
              {createDealMutation.isPending ? "Creating..." : "Create Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
