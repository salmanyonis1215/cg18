import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProducts } from "@/hooks/useSupabaseData";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const { data: products = [] } = useProducts();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("kg");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("products").insert({ name, unit });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Product added.");
    queryClient.invalidateQueries({ queryKey: ["products"] });
    setOpen(false);
    setName(""); setUnit("kg");
  };

  const columns = [
    { header: "Name", accessor: "name" as const },
    { header: "Unit", accessor: "unit" as const },
  ];

  return (
    <div>
      <PageHeader title="Products">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Product</Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader><SheetTitle>Add Product</SheetTitle></SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Product Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Unit</Label>
                <Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="kg" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Adding..." : "Add Product"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </PageHeader>
      <DataTable columns={columns} data={products} />
    </div>
  );
}
