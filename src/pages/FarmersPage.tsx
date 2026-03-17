import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFarmers, useDeliveries, useSales } from "@/hooks/useSupabaseData";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { toast } from "sonner";

function FarmerSettlementCard({ farmerName, totalSales, totalTransport }: { farmerName: string; totalSales: number; totalTransport: number }) {
  const commission = totalSales * 0.10;
  const net = totalSales - commission - totalTransport;
  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{farmerName} — Payout</h3>
      <div className="mt-3 space-y-1.5">
        <div className="flex justify-between text-sm"><span>Gross Sales</span><span className="font-mono">${totalSales.toFixed(2)}</span></div>
        <div className="flex justify-between text-sm text-destructive"><span>Commission (10%)</span><span className="font-mono">-${commission.toFixed(2)}</span></div>
        <div className="flex justify-between text-sm text-destructive"><span>Transport</span><span className="font-mono">-${totalTransport.toFixed(2)}</span></div>
        <div className="pt-2 mt-2 border-t border-border flex justify-between text-base font-bold">
          <span>Net Payable</span>
          <span className="font-mono text-success">${net.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default function FarmersPage() {
  const queryClient = useQueryClient();
  const { data: farmers = [] } = useFarmers();
  const { data: deliveries = [] } = useDeliveries();
  const { data: sales = [] } = useSales();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("farmers").insert({ name });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Farmer added.");
    queryClient.invalidateQueries({ queryKey: ["farmers"] });
    setOpen(false);
    setName("");
  };

  // Calculate settlements per farmer
  const farmerSettlements = farmers.map(f => {
    const farmerDeliveries = deliveries.filter(d => d.farmer_id === f.id);
    const farmerProductIds = farmerDeliveries.map(d => d.product_id);
    const farmerSales = sales.filter(s => farmerProductIds.includes(s.product_id));
    const totalSales = farmerSales.reduce((sum, s) => sum + (s.total_price || 0), 0);
    const totalTransport = farmerDeliveries.reduce((sum, d) => sum + (d.total_transport_cost || 0), 0);
    return { ...f, totalSales, totalTransport };
  });

  const columns = [
    { header: "Name", accessor: "name" as const },
    { header: "Total Sales", accessor: (r: any) => `$${r.totalSales.toFixed(2)}`, className: "font-mono text-right" },
    { header: "Transport", accessor: (r: any) => `$${r.totalTransport.toFixed(2)}`, className: "font-mono text-right" },
    { header: "Net Payable", accessor: (r: any) => {
      const net = r.totalSales - (r.totalSales * 0.1) - r.totalTransport;
      return <span className="font-mono font-bold text-success">${net.toFixed(2)}</span>;
    }, className: "text-right" },
  ];

  return (
    <div>
      <PageHeader title="Farmers & Settlements">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Farmer</Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader><SheetTitle>Add Farmer</SheetTitle></SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Farmer Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Adding..." : "Add Farmer"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </PageHeader>
      <DataTable columns={columns} data={farmerSettlements} />

      {farmerSettlements.filter(f => f.totalSales > 0).length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-bold text-foreground mb-4">Settlement Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farmerSettlements.filter(f => f.totalSales > 0).map(f => (
              <FarmerSettlementCard key={f.id} farmerName={f.name} totalSales={f.totalSales} totalTransport={f.totalTransport} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
