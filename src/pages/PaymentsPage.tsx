import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePayments, useCustomers } from "@/hooks/useSupabaseData";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function PaymentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: payments = [] } = usePayments();
  const { data: customers = [] } = useCustomers();

  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedCustomer = customers.find(c => c.id === customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("payments").insert({
      customer_id: customerId,
      salesman_id: user.id,
      amount: parseFloat(amount),
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    const newBalance = (selectedCustomer?.balance || 0) - parseFloat(amount);
    toast.success(`Payment recorded. Customer balance updated to $${newBalance.toFixed(2)}.`);
    queryClient.invalidateQueries({ queryKey: ["payments"] });
    queryClient.invalidateQueries({ queryKey: ["customers"] });
    setOpen(false);
    setCustomerId(""); setAmount("");
  };

  const columns = [
    { header: "Date", accessor: "date" as const, className: "w-24" },
    { header: "Customer", accessor: (r: any) => r.customers?.name || "" },
    { header: "Amount", accessor: (r: any) => `$${Number(r.amount).toFixed(2)}`, className: "font-mono text-right w-28 font-medium text-success" },
    { header: "Collected By", accessor: (r: any) => r.profiles?.name || "" },
  ];

  return (
    <div>
      <PageHeader title="Payments">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Record Payment</Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader><SheetTitle>Record Collection</SheetTitle></SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Customer</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} — <span className="font-mono">${(c.balance || 0).toFixed(2)}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCustomer && (
                <div className="p-3 bg-muted rounded-md text-sm">
                  Current Balance: <span className="font-mono font-bold">${(selectedCustomer.balance || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Amount ($)</Label>
                <Input type="number" step="0.01" min="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !customerId}>
                {loading ? "Recording..." : "Record Payment"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </PageHeader>
      <DataTable columns={columns} data={payments} />
    </div>
  );
}
