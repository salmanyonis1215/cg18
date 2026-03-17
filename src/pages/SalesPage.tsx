import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSales, useCustomers, useProducts } from "@/hooks/useSupabaseData";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function SalesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: sales = [] } = useSales();
  const { data: customers = [] } = useCustomers();
  const { data: products = [] } = useProducts();

  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("sales").insert({
      customer_id: customerId,
      product_id: productId,
      salesman_id: user.id,
      quantity: parseFloat(quantity),
      price_per_unit: parseFloat(pricePerUnit),
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    const total = parseFloat(quantity) * parseFloat(pricePerUnit);
    toast.success(`Sale recorded. Amount: $${total.toFixed(2)}`);
    queryClient.invalidateQueries({ queryKey: ["sales"] });
    queryClient.invalidateQueries({ queryKey: ["customers"] });
    setOpen(false);
    setCustomerId(""); setProductId(""); setQuantity(""); setPricePerUnit("");
  };

  const columns = [
    { header: "Date", accessor: "date" as const, className: "w-24" },
    { header: "Customer", accessor: (r: any) => r.customers?.name || "" },
    { header: "Product", accessor: (r: any) => r.products?.name || "" },
    { header: "Qty", accessor: "quantity" as const, className: "font-mono text-right w-20" },
    { header: "Price/Unit", accessor: (r: any) => `$${Number(r.price_per_unit).toFixed(2)}`, className: "font-mono text-right w-24" },
    { header: "Total", accessor: (r: any) => `$${Number(r.total_price || 0).toFixed(2)}`, className: "font-mono text-right w-24 font-medium" },
    { header: "Salesman", accessor: (r: any) => r.profiles?.name || "" },
  ];

  return (
    <div>
      <PageHeader title="Sales">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />New Sale</Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader><SheetTitle>Record Sale</SheetTitle></SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Customer</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
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
                  <Label className="text-xs text-muted-foreground">Price/Unit ($)</Label>
                  <Input type="number" step="0.01" value={pricePerUnit} onChange={e => setPricePerUnit(e.target.value)} required />
                </div>
              </div>
              {quantity && pricePerUnit && (
                <div className="p-3 bg-muted rounded-md text-sm">
                  Total: <span className="font-mono font-bold">${(parseFloat(quantity) * parseFloat(pricePerUnit)).toFixed(2)}</span>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading || !customerId || !productId}>
                {loading ? "Recording..." : "Record Sale"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </PageHeader>
      <DataTable columns={columns} data={sales} />
    </div>
  );
}
