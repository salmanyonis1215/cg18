import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSales, usePayments, useCustomers, useDeliveries, useProducts, useExpenses } from "@/hooks/useSupabaseData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(221,83%,53%)", "hsl(142,71%,45%)", "hsl(38,92%,50%)", "hsl(0,84%,60%)", "hsl(270,70%,60%)"];

export default function DashboardPage() {
  const { isAdmin, profile } = useAuth();
  const { data: sales = [] } = useSales();
  const { data: payments = [] } = usePayments();
  const { data: customers = [] } = useCustomers();
  const { data: deliveries = [] } = useDeliveries();
  const { data: products = [] } = useProducts();
  const { data: expenses = [] } = useExpenses();

  const totalSales = sales.reduce((sum, s) => sum + (s.total_price || 0), 0);
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalDebt = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
  const commission = totalSales * 0.1;
  const totalTransport = deliveries.reduce((sum, d) => sum + (d.total_transport_cost || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = commission - totalExpenses;

  // Today's summary
  const today = new Date().toISOString().split("T")[0];
  const todaySales = sales.filter(s => s.date === today).reduce((sum, s) => sum + (s.total_price || 0), 0);
  const todayPayments = payments.filter(p => p.date === today).reduce((sum, p) => sum + p.amount, 0);

  // Top 5 customers by debt
  const topDebtors = useMemo(() =>
    [...customers].filter(c => (c.balance || 0) > 0).sort((a, b) => (b.balance || 0) - (a.balance || 0)).slice(0, 5),
    [customers]
  );

  // Sales by product (for pie chart)
  const salesByProduct = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach(s => {
      const name = (s as any).products?.name || "Unknown";
      map[name] = (map[name] || 0) + (s.total_price || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [sales]);

  // Low stock alerts
  const lowStockProducts = useMemo(() =>
    products.filter(p => (p.stock ?? 0) <= 10).sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0)),
    [products]
  );

  // Last 7 days sales trend
  const salesTrend = useMemo(() => {
    const days: { date: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      const amount = sales.filter(s => s.date === dateStr).reduce((sum, s) => sum + (s.total_price || 0), 0);
      days.push({ date: dayLabel, amount });
    }
    return days;
  }, [sales]);

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <PageHeader title={isAdmin ? "Market Operations Overview" : `${profile?.name}'s Dashboard`} />

      {/* Today's Summary */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">📊 Today's Summary</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-muted-foreground">Sales:</span> <span className="font-mono font-bold">{fmt(todaySales)}</span></div>
            <div><span className="text-muted-foreground">Collected:</span> <span className="font-mono font-bold text-success">{fmt(todayPayments)}</span></div>
            <div><span className="text-muted-foreground">New Debt:</span> <span className="font-mono font-bold text-warning">{fmt(todaySales - todayPayments)}</span></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Sales" value={fmt(totalSales)} />
        <StatCard label="Outstanding Debt" value={fmt(totalDebt)} variant="warning" />
        <StatCard label="Collections" value={fmt(totalPayments)} variant="success" />
        <StatCard label="Commission (10%)" value={fmt(commission)} />
      </div>

      {isAdmin && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Expenses" value={fmt(totalExpenses)} variant="destructive" />
            <StatCard label="Transport Costs" value={fmt(totalTransport)} variant="destructive" />
            <StatCard label="Net Profit" value={fmt(netProfit)} variant={netProfit >= 0 ? "success" : "destructive"} />
            <StatCard label="Farmer Payable" value={fmt(totalSales - commission - totalTransport)} variant="success" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Sales Trend Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sales — Last 7 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={salesTrend}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Bar dataKey="amount" fill="hsl(221,83%,53%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sales by Product */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Top Products by Sales</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={salesByProduct} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} strokeWidth={2}>
                      {salesByProduct.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {salesByProduct.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="truncate flex-1">{p.name}</span>
                      <span className="font-mono text-muted-foreground">{fmt(p.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Top Debtors */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Top Debtors</CardTitle>
              </CardHeader>
              <CardContent>
                {topDebtors.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No outstanding debts</p>
                ) : (
                  <div className="space-y-2">
                    {topDebtors.map(c => (
                      <div key={c.id} className="flex justify-between items-center text-sm">
                        <span>{c.name}</span>
                        <span className="font-mono font-bold text-warning">{fmt(c.balance || 0)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Low Stock Alerts */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">⚠️ Low Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {lowStockProducts.length === 0 ? (
                  <p className="text-xs text-muted-foreground">All products in stock</p>
                ) : (
                  <div className="space-y-2">
                    {lowStockProducts.map(p => (
                      <div key={p.id} className="flex justify-between items-center text-sm">
                        <span>{p.name}</span>
                        <span className={`font-mono font-bold ${(p.stock ?? 0) <= 0 ? "text-destructive" : "text-warning"}`}>
                          {p.stock ?? 0} {p.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
