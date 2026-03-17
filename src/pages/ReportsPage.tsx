import { useState, useRef } from "react";
import { format } from "date-fns";
import { CalendarIcon, Printer, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSales, usePayments, useCustomers, useFarmers, useDeliveries, useProfiles } from "@/hooks/useSupabaseData";

type ReportType = "date" | "customer" | "farmer" | "salesman";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("date");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedId, setSelectedId] = useState("");
  const [generated, setGenerated] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: sales = [] } = useSales();
  const { data: payments = [] } = usePayments();
  const { data: customers = [] } = useCustomers();
  const { data: farmers = [] } = useFarmers();
  const { data: deliveries = [] } = useDeliveries();
  const { data: profiles = [] } = useProfiles();

  const handleGenerate = () => {
    setGenerated(true);
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>VBMS Report</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 24px; color: #1a1a1a; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 13px; }
        th { background: #f5f5f5; font-weight: 600; text-transform: uppercase; font-size: 11px; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        h2 { font-size: 16px; margin-top: 24px; margin-bottom: 8px; }
        .summary { display: flex; gap: 24px; margin: 16px 0; }
        .summary-item { padding: 12px 16px; background: #f9f9f9; border-radius: 6px; }
        .summary-label { font-size: 11px; text-transform: uppercase; color: #666; }
        .summary-value { font-size: 18px; font-weight: 700; margin-top: 4px; }
        .meta { color: #666; font-size: 12px; margin-bottom: 16px; }
        .mono { font-family: monospace; }
        @media print { body { padding: 0; } }
      </style></head><body>${content.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Filter logic
  const filterByDate = <T extends { date?: string | null }>(items: T[]) => {
    return items.filter(item => {
      if (!item.date) return false;
      const d = new Date(item.date);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > new Date(dateTo.getTime() + 86400000)) return false;
      return true;
    });
  };

  const filteredSales = filterByDate(sales);
  const filteredPayments = filterByDate(payments);
  const filteredDeliveries = filterByDate(deliveries);

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const renderDateReport = () => {
    const totalSales = filteredSales.reduce((s, r) => s + (r.total_price || 0), 0);
    const totalPayments = filteredPayments.reduce((s, r) => s + r.amount, 0);
    const totalTransport = filteredDeliveries.reduce((s, r) => s + (r.total_transport_cost || 0), 0);
    const commission = totalSales * 0.1;

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
            { label: "Transport Costs", value: fmt(totalTransport) },
          ].map(s => (
            <div key={s.label} style={{ padding: "12px 16px", background: "#f9f9f9", borderRadius: 6, minWidth: 140 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", color: "#666" }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, fontFamily: "monospace" }}>{s.value}</div>
            </div>
          ))}
        </div>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginTop: 16 }}>Sales ({filteredSales.length})</h2>
        <table><thead><tr><th>Date</th><th>Customer</th><th>Product</th><th>Qty</th><th>Price/Unit</th><th>Total</th><th>Salesman</th></tr></thead>
        <tbody>{filteredSales.map(s => (
          <tr key={s.id}><td>{s.date}</td><td>{(s as any).customers?.name}</td><td>{(s as any).products?.name}</td>
          <td className="mono">{s.quantity}</td><td className="mono">{fmt(s.price_per_unit)}</td>
          <td className="mono">{fmt(s.total_price || 0)}</td><td>{(s as any).profiles?.name}</td></tr>
        ))}</tbody></table>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginTop: 16 }}>Payments ({filteredPayments.length})</h2>
        <table><thead><tr><th>Date</th><th>Customer</th><th>Amount</th><th>Collected By</th></tr></thead>
        <tbody>{filteredPayments.map(p => (
          <tr key={p.id}><td>{p.date}</td><td>{(p as any).customers?.name}</td>
          <td className="mono">{fmt(p.amount)}</td><td>{(p as any).profiles?.name}</td></tr>
        ))}</tbody></table>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginTop: 16 }}>Deliveries ({filteredDeliveries.length})</h2>
        <table><thead><tr><th>Date</th><th>Farmer</th><th>Product</th><th>Qty</th><th>Transport</th><th>Driver</th></tr></thead>
        <tbody>{filteredDeliveries.map(d => (
          <tr key={d.id}><td>{d.date}</td><td>{(d as any).farmers?.name}</td><td>{(d as any).products?.name}</td>
          <td className="mono">{d.quantity}</td><td className="mono">{fmt(d.total_transport_cost || 0)}</td><td>{d.driver_name}</td></tr>
        ))}</tbody></table>
      </div>
    );
  };

  const renderCustomerReport = () => {
    const customer = customers.find(c => c.id === selectedId);
    if (!customer) return <p>Select a customer.</p>;
    const custSales = filteredSales.filter(s => s.customer_id === selectedId);
    const custPayments = filteredPayments.filter(p => p.customer_id === selectedId);
    const totalSold = custSales.reduce((s, r) => s + (r.total_price || 0), 0);
    const totalPaid = custPayments.reduce((s, r) => s + r.amount, 0);

    return (
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Customer Report: {customer.name}</h2>
        <p className="meta" style={{ color: "#666", fontSize: 12 }}>Phone: {customer.phone || "N/A"} | Balance: {fmt(customer.balance || 0)}</p>
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
          <tr key={s.id}><td>{s.date}</td><td>{(s as any).products?.name}</td><td className="mono">{s.quantity}</td>
          <td className="mono">{fmt(s.price_per_unit)}</td><td className="mono">{fmt(s.total_price || 0)}</td></tr>
        ))}</tbody></table>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginTop: 16 }}>Payments ({custPayments.length})</h2>
        <table><thead><tr><th>Date</th><th>Amount</th><th>Collected By</th></tr></thead>
        <tbody>{custPayments.map(p => (
          <tr key={p.id}><td>{p.date}</td><td className="mono">{fmt(p.amount)}</td><td>{(p as any).profiles?.name}</td></tr>
        ))}</tbody></table>
      </div>
    );
  };

  const renderFarmerReport = () => {
    const farmer = farmers.find(f => f.id === selectedId);
    if (!farmer) return <p>Select a farmer.</p>;
    const farmerDeliveries = filteredDeliveries.filter(d => d.farmer_id === selectedId);
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
          <tr key={d.id}><td>{d.date}</td><td>{(d as any).products?.name}</td><td className="mono">{d.quantity}</td>
          <td className="mono">{fmt(d.transport_cost_per_unit || 0)}</td><td className="mono">{fmt(d.total_transport_cost || 0)}</td><td>{d.driver_name}</td></tr>
        ))}</tbody></table>
      </div>
    );
  };

  const renderSalesmanReport = () => {
    const salesman = profiles.find(p => p.id === selectedId);
    if (!salesman) return <p>Select a salesman.</p>;
    const smSales = filteredSales.filter(s => s.salesman_id === selectedId);
    const smPayments = filteredPayments.filter(p => p.salesman_id === selectedId);
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
          <tr key={s.id}><td>{s.date}</td><td>{(s as any).customers?.name}</td><td>{(s as any).products?.name}</td>
          <td className="mono">{s.quantity}</td><td className="mono">{fmt(s.total_price || 0)}</td></tr>
        ))}</tbody></table>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginTop: 16 }}>Payments Collected ({smPayments.length})</h2>
        <table><thead><tr><th>Date</th><th>Customer</th><th>Amount</th></tr></thead>
        <tbody>{smPayments.map(p => (
          <tr key={p.id}><td>{p.date}</td><td>{(p as any).customers?.name}</td><td className="mono">{fmt(p.amount)}</td></tr>
        ))}</tbody></table>
      </div>
    );
  };

  const renderReport = () => {
    switch (reportType) {
      case "date": return renderDateReport();
      case "customer": return renderCustomerReport();
      case "farmer": return renderFarmerReport();
      case "salesman": return renderSalesmanReport();
    }
  };

  const needsSelection = reportType !== "date";
  const selectionOptions = reportType === "customer" ? customers : reportType === "farmer" ? farmers : profiles;
  const selectionLabel = reportType === "customer" ? "Customer" : reportType === "farmer" ? "Farmer" : "Salesman";

  return (
    <div>
      <PageHeader title="Reports">
        {generated && (
          <Button size="sm" variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" /> Print Report
          </Button>
        )}
      </PageHeader>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Report Type</Label>
              <Select value={reportType} onValueChange={(v) => { setReportType(v as ReportType); setSelectedId(""); setGenerated(false); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">By Date Range</SelectItem>
                  <SelectItem value="customer">By Customer</SelectItem>
                  <SelectItem value="farmer">By Farmer</SelectItem>
                  <SelectItem value="salesman">By Salesman</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {needsSelection && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{selectionLabel}</Label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger><SelectValue placeholder={`Select ${selectionLabel.toLowerCase()}`} /></SelectTrigger>
                  <SelectContent>
                    {selectionOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {dateFrom ? format(dateFrom, "PPP") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {dateTo ? format(dateTo, "PPP") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={handleGenerate} disabled={needsSelection && !selectedId}>
              <FileText className="h-4 w-4 mr-1" /> Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {generated && (
        <Card>
          <CardContent className="p-6">
            <div ref={printRef}>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>VBMS — Market Ledger Report</h1>
              <p style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>Generated on {format(new Date(), "PPPp")}</p>
              {renderReport()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
