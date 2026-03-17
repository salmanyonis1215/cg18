import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCustomers } from "@/hooks/useSupabaseData";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { toast } from "sonner";

function DebtBadge({ balance }: { balance: number }) {
  const isHigh = balance > 5000;
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${
      isHigh
        ? "bg-warning/10 text-warning border border-warning/20"
        : "bg-muted text-muted-foreground border border-border"
    }`}>
      ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
    </span>
  );
}

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const { data: customers = [] } = useCustomers();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("customers").insert({ name, phone: phone || null });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Customer added.");
    queryClient.invalidateQueries({ queryKey: ["customers"] });
    setOpen(false);
    setName(""); setPhone("");
  };

  const columns = [
    { header: "Name", accessor: "name" as const },
    { header: "Phone", accessor: "phone" as const },
    { header: "Balance", accessor: (r: any) => <DebtBadge balance={r.balance || 0} />, className: "text-right" },
  ];

  return (
    <div>
      <PageHeader title="Customers">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Customer</Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader><SheetTitle>Add Customer</SheetTitle></SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Phone (optional)</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Adding..." : "Add Customer"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </PageHeader>
      <DataTable columns={columns} data={customers} />
    </div>
  );
}
