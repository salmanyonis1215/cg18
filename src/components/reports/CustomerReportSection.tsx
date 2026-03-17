interface Props {
  customer: any;
  sales: any[];
  payments: any[];
  selectedId: string;
  fmt: (n: number) => string;
}

export function CustomerReportSection({ customer, sales, payments, selectedId, fmt }: Props) {
  if (!customer) return <p>Select a customer.</p>;
  const custSales = sales.filter(s => s.customer_id === selectedId);
  const custPayments = payments.filter(p => p.customer_id === selectedId);
  const totalSold = custSales.reduce((s, r) => s + (r.total_price || 0), 0);
  const totalPaid = custPayments.reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600 }}>Customer Report: {customer.name}</h2>
      <p className="meta" style={{ color: "#666", fontSize: 12 }}>
        Phone: {customer.phone || "N/A"} | Location: {customer.location || "N/A"} | Credit Limit: {customer.credit_limit != null ? fmt(customer.credit_limit) : "Unlimited"}
      </p>
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        {[{ label: "Total Purchases", value: fmt(totalSold) }, { label: "Total Payments", value: fmt(totalPaid) }, { label: "Current Balance", value: fmt(customer.balance || 0) }].map(s => (
          <div key={s.label} style={{ padding: "12px 16px", background: "#f9f9f9", borderRadius: 6, minWidth: 140 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", color: "#666" }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, fontFamily: "monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: 14, fontWeight: 600, marginTop: 16 }}>Purchases ({custSales.length})</h2>
      <table><thead><tr><th>Date</th><th>Product</th><th>Qty</th><th>Price/Unit</th><th>Total</th></tr></thead>
      <tbody>{custSales.map(s => (
        <tr key={s.id}><td>{s.date}</td><td>{s.products?.name}</td><td className="mono">{s.quantity}</td>
        <td className="mono">{fmt(s.price_per_unit)}</td><td className="mono">{fmt(s.total_price || 0)}</td></tr>
      ))}</tbody></table>
      <h2 style={{ fontSize: 14, fontWeight: 600, marginTop: 16 }}>Payments ({custPayments.length})</h2>
      <table><thead><tr><th>Date</th><th>Amount</th><th>Collected By</th></tr></thead>
      <tbody>{custPayments.map(p => (
        <tr key={p.id}><td>{p.date}</td><td className="mono">{fmt(p.amount)}</td><td>{p.profiles?.name}</td></tr>
      ))}</tbody></table>
    </div>
  );
}
