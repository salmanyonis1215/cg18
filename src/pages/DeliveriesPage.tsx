import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDeliveries, useFarmers, useProducts } from "@/hooks/useSupabaseData";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function DeliveriesPage() {
  const queryClient = useQueryClient();
  const { data: deliveries = [] } = useDeliveries();
  const { data: farmers = [] } = useFarmers();
  const { data: products = [] } = useProducts();

  const [open, setOpen] = useState(false);
  const [farmerId, setFarmerId] = useState("");
  const [driverName, setDriverName] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [transportCost, setTransportCost] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("deliveries").insert({
      farmer_id: farmerId,
      driver_name: driverName,
      product_id: productId,
      quantity: parseFloat(quantity),
      transport_cost_per_unit: transportCost ? parseFloat(transportCost) : 0,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Delivery recorded.");
    queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    setOpen(false);
    setFarmerId(""); setDriverName(""); setProductId(""); setQuantity(""); setTransportCost("");
  };

  const columns = [
    { header: "Date", accessor: "date" as const, className: "w-24" },
    { header: "Farmer", accessor: (r: any) => r.farmers?.name || "" },
    { header: "Driver", accessor: "driver_name" as const },
    { header: "Product", accessor: (r: any) => r.products?.name || "" },
    { header: "Qty", accessor: "quantity" as const, className: "font-mono text-right w-20" },
    { header: "Transport/Unit", accessor: (r: any) => `$${Number(r.transport_cost_per_unit || 0).toFixed(2)}`, className: "font-mono text-right w-28" },
    { header: "Total Transport", accessor: (r: any) => `$${Number(r.total_transport_cost || 0).toFixed(2)}`, className: "font-mono text-right w-28" },
  ];

  return (
    <div>
      <PageHeader title="Deliveries">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />New Delivery</Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader><SheetTitle>Record Delivery</SheetTitle></SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Farmer</Label>
                <Select value={farmerId} onValueChange={setFarmerId}>
                  <SelectTrigger><SelectValue placeholder="Select farmer" /></SelectTrigger>
                  <SelectContent>
                    {farmers.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Driver Name</Label>
                <Input value={driverName} onChange={e => setDriverName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Product</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>
                    {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Quantity</Label>
                  <Input type="number" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Transport $/Unit</Label>
                  <Input type="number" step="0.01" value={transportCost} onChange={e => setTransportCost(e.target.value)} placeholder="0" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading || !farmerId || !productId}>
                {loading ? "Recording..." : "Record Delivery"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </PageHeader>
      <DataTable columns={columns} data={deliveries} />
    </div>
  );
}
