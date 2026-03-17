import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { useSales, usePayments, useCustomers, useDeliveries } from "@/hooks/useSupabaseData";

export default function DashboardPage() {
  const { isAdmin, profile } = useAuth();
  const { data: sales = [] } = useSales();
  const { data: payments = [] } = usePayments();
  const { data: customers = [] } = useCustomers();
  const { data: deliveries = [] } = useDeliveries();

  const totalSales = sales.reduce((sum, s) => sum + (s.total_price || 0), 0);
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalDebt = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
  const commission = totalSales * 0.1;
  const totalTransport = deliveries.reduce((sum, d) => sum + (d.total_transport_cost || 0), 0);
  const farmerPayable = totalSales - commission - totalTransport;

  return (
    <div>
      <PageHeader title={isAdmin ? "Market Operations Overview" : `${profile?.name}'s Dashboard`} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Sales" value={`$${totalSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} />
        <StatCard label="Outstanding Debt" value={`$${totalDebt.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} variant="warning" />
        <StatCard label="Collections" value={`$${totalPayments.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} variant="success" />
        <StatCard label="Commission (10%)" value={`$${commission.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} />
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard label="Total Transport Costs" value={`$${totalTransport.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} variant="destructive" />
          <StatCard label="Farmer Payable" value={`$${farmerPayable.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} variant="success" />
        </div>
      )}
    </div>
  );
}
