interface Props {
  salesman: any;
  sales: any[];
  payments: any[];
  selectedId: string;
  fmt: (n: number) => string;
}

export function SalesmanReportSection({ salesman, sales, payments, selectedId, fmt }: Props) {
  if (!salesman) return <p>Select a salesman.</p>;
  const smSales = sales.filter(s => s.salesman_id === selectedId);
  const smPayments = payments.filter(p => p.salesman_id === selectedId);
  const totalSold = smSales.reduce((s, r) => s + (r.total_price || 0), 0);
  const totalCollected = smPayments.reduce((s, r) => s + r.amount, 0);
  const commission = totalSold * 0.1;

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600 }}>Salesman Report: {salesman.name}</h2>
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        {[{ label: "Total Sales", value: fmt(totalSold) }, { label: "Collections", value: fmt(totalCollected) }, { label: "Commission (10%)", value: fmt(commission) }].map(s => (
          <div key={s.label} style={{ padding: "12px 16px", background: "#f9f9f9", borderRadius: 6, minWidth: 140 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", color: "#666" }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, fontFamily: "monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: 14, fontWeight: 600, marginTop: 16 }}>Sales ({smSales.length})</h2>
      <table><thead><tr><th>Date</th><th>Customer</th><th>Product</th><th>Qty</th><th>Total</th></tr></thead>
      <tbody>{smSales.map(s => (
        <tr key={s.id}><td>{s.date}</td><td>{s.customers?.name}</td><td>{s.products?.name}</td>
        <td className="mono">{s.quantity}</td><td className="mono">{fmt(s.total_price || 0)}</td></tr>
      ))}</tbody></table>
      <h2 style={{ fontSize: 14, fontWeight: 600, marginTop: 16 }}>Payments Collected ({smPayments.length})</h2>
      <table><thead><tr><th>Date</th><th>Customer</th><th>Amount</th></tr></thead>
      <tbody>{smPayments.map(p => (
        <tr key={p.id}><td>{p.date}</td><td>{p.customers?.name}</td><td className="mono">{fmt(p.amount)}</td></tr>
      ))}</tbody></table>
    </div>
  );
}
