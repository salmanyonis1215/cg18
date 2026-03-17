import { format } from "date-fns";

interface Props {
  sales: any[];
  payments: any[];
  deliveries: any[];
  expenses: any[];
  dateFrom?: Date;
  dateTo?: Date;
  fmt: (n: number) => string;
}

export function DateReportSection({ sales, payments, deliveries, expenses, dateFrom, dateTo, fmt }: Props) {
  const totalSales = sales.reduce((s, r) => s + (r.total_price || 0), 0);
  const totalPayments = payments.reduce((s, r) => s + r.amount, 0);
  const totalTransport = deliveries.reduce((s, r) => s + (r.total_transport_cost || 0), 0);
  const totalExpenses = expenses.reduce((s, r) => s + r.amount, 0);
  const commission = totalSales * 0.1;
  const netProfit = commission - totalExpenses;

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Date Range Report</h2>
      <p className="meta" style={{ color: "#666", fontSize: 12 }}>
        {dateFrom ? format(dateFrom, "PPP") : "All time"} — {dateTo ? format(dateTo, "PPP") : "Present"}
      </p>
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { label: "Total Sales", value: fmt(totalSales) },
          { label: "Total Payments", value: fmt(totalPayments) },
          { label: "Commission (10%)", value: fmt(commission) },
          { label: "Expenses", value: fmt(totalExpenses) },
          { label: "Transport", value: fmt(totalTransport) },
          { label: "Net Profit", value: fmt(netProfit) },
        ].map(s => (
          <div key={s.label} style={{ padding: "12px 16px", background: "#f9f9f9", borderRadius: 6, minWidth: 130 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", color: "#666" }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, fontFamily: "monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: 14, fontWeight: 600, marginTop: 16 }}>Sales ({sales.length})</h2>
      <table><thead><tr><th>Date</th><th>Customer</th><th>Product</th><th>Qty</th><th>Price/Unit</th><th>Total</th><th>Salesman</th></tr></thead>
      <tbody>{sales.map(s => (
        <tr key={s.id}><td>{s.date}</td><td>{s.customers?.name}</td><td>{s.products?.name}</td>
        <td className="mono">{s.quantity}</td><td className="mono">{fmt(s.price_per_unit)}</td>
        <td className="mono">{fmt(s.total_price || 0)}</td><td>{s.profiles?.name}</td></tr>
      ))}</tbody></table>
      <h2 style={{ fontSize: 14, fontWeight: 600, marginTop: 16 }}>Payments ({payments.length})</h2>
      <table><thead><tr><th>Date</th><th>Customer</th><th>Amount</th><th>Collected By</th></tr></thead>
      <tbody>{payments.map(p => (
        <tr key={p.id}><td>{p.date}</td><td>{p.customers?.name}</td>
        <td className="mono">{fmt(p.amount)}</td><td>{p.profiles?.name}</td></tr>
      ))}</tbody></table>
      <h2 style={{ fontSize: 14, fontWeight: 600, marginTop: 16 }}>Expenses ({expenses.length})</h2>
      <table><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
      <tbody>{expenses.map(e => (
        <tr key={e.id}><td>{e.date}</td><td>{e.category}</td><td>{e.description || "—"}</td>
        <td className="mono">{fmt(e.amount)}</td></tr>
      ))}</tbody></table>
      <h2 style={{ fontSize: 14, fontWeight: 600, marginTop: 16 }}>Deliveries ({deliveries.length})</h2>
      <table><thead><tr><th>Date</th><th>Farmer</th><th>Product</th><th>Qty</th><th>Transport</th><th>Driver</th></tr></thead>
      <tbody>{deliveries.map(d => (
        <tr key={d.id}><td>{d.date}</td><td>{d.farmers?.name}</td><td>{d.products?.name}</td>
        <td className="mono">{d.quantity}</td><td className="mono">{fmt(d.total_transport_cost || 0)}</td><td>{d.driver_name}</td></tr>
      ))}</tbody></table>
    </div>
  );
}
