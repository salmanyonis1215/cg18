import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useExpenses } from "@/hooks/useSupabaseData";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/StatCard";

const CATEGORIES = [
  { value: "salary", label: "Salary" },
  { value: "market", label: "Market Expense" },
  { value: "transport", label: "Transport" },
  { value: "other", label: "Other" },
];

export default function ExpensesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: expenses = [] } = useExpenses();

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("expenses").insert({
      category,
      description: description || null,
      amount: parseFloat(amount),
      created_by: user.id,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Expense recorded.");
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    setOpen(false);
    setCategory(""); setDescription(""); setAmount("");
  };

  const totalByCategory = CATEGORIES.map(c => ({
    label: c.label,
    total: expenses.filter(e => e.category === c.value).reduce((s, e) => s + e.amount, 0),
  }));

  const grandTotal = expenses.reduce((s, e) => s + e.amount, 0);

  const columns = [
    { header: "Date", accessor: "date" as const, className: "w-24" },
    { header: "Category", accessor: (r: any) => CATEGORIES.find(c => c.value === r.category)?.label || r.category },
    { header: "Description", accessor: "description" as const },
    { header: "Amount", accessor: (r: any) => `$${Number(r.amount).toFixed(2)}`, className: "font-mono text-right w-24 font-medium" },
  ];

  return (
    <div>
      <PageHeader title="Expenses">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Expense</Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader><SheetTitle>Record Expense</SheetTitle></SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Description (optional)</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Driver Ali salary" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Amount ($)</Label>
                <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !category}>
                {loading ? "Recording..." : "Record Expense"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Expenses" value={`$${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} variant="destructive" />
        {totalByCategory.map(c => (
          <StatCard key={c.label} label={c.label} value={`$${c.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} />
        ))}
      </div>

      <DataTable columns={columns} data={expenses} />
    </div>
  );
}
