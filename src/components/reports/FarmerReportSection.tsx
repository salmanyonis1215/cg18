interface Props {
  farmer: any;
  deliveries: any[];
  selectedId: string;
  fmt: (n: number) => string;
}

export function FarmerReportSection({ farmer, deliveries, selectedId, fmt }: Props) {
  if (!farmer) return <p>Select a farmer.</p>;
  const farmerDeliveries = deliveries.filter(d => d.farmer_id === selectedId);
  const totalQty = farmerDeliveries.reduce((s, d) => s + d.quantity, 0);
  const totalTransport = farmerDeliveries.reduce((s, d) => s + (d.total_transport_cost || 0), 0);

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600 }}>Farmer Report: {farmer.name}</h2>
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        {[{ label: "Total Deliveries", value: String(farmerDeliveries.length) }, { label: "Total Quantity", value: String(totalQty) }, { label: "Transport Costs", value: fmt(totalTransport) }].map(s => (
          <div key={s.label} style={{ padding: "12px 16px", background: "#f9f9f9", borderRadius: 6, minWidth: 140 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", color: "#666" }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, fontFamily: "monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: 14, fontWeight: 600, marginTop: 16 }}>Deliveries ({farmerDeliveries.length})</h2>
      <table><thead><tr><th>Date</th><th>Product</th><th>Qty</th><th>Transport/Unit</th><th>Total Transport</th><th>Driver</th></tr></thead>
      <tbody>{farmerDeliveries.map(d => (
        <tr key={d.id}><td>{d.date}</td><td>{d.products?.name}</td><td className="mono">{d.quantity}</td>
        <td className="mono">{fmt(d.transport_cost_per_unit || 0)}</td><td className="mono">{fmt(d.total_transport_cost || 0)}</td><td>{d.driver_name}</td></tr>
      ))}</tbody></table>
    </div>
  );
}
