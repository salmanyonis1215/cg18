import { useState, useRef } from "react";
import { format } from "date-fns";
import { CalendarIcon, Printer, FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSales, usePayments, useCustomers, useFarmers, useDeliveries, useProfiles, useExpenses } from "@/hooks/useSupabaseData";
import { DateReportSection } from "@/components/reports/DateReportSection";
import { CustomerReportSection } from "@/components/reports/CustomerReportSection";
import { FarmerReportSection } from "@/components/reports/FarmerReportSection";
import { SalesmanReportSection } from "@/components/reports/SalesmanReportSection";

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
  const { data: expenses = [] } = useExpenses();

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

  const handleExportCSV = () => {
    const content = printRef.current;
    if (!content) return;
    const tables = content.querySelectorAll("table");
    let csv = "";
    tables.forEach(table => {
      const rows = table.querySelectorAll("tr");
      rows.forEach(row => {
        const cells = row.querySelectorAll("th, td");
        csv += Array.from(cells).map(c => `"${c.textContent?.replace(/"/g, '""') || ""}"`).join(",") + "\n";
      });
      csv += "\n";
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${reportType}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
  const filteredExpenses = filterByDate(expenses);

  const needsSelection = reportType !== "date";
  const selectionOptions = reportType === "customer" ? customers : reportType === "farmer" ? farmers : profiles;
  const selectionLabel = reportType === "customer" ? "Customer" : reportType === "farmer" ? "Farmer" : "Salesman";

  const renderReport = () => {
    const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    switch (reportType) {
      case "date":
        return <DateReportSection sales={filteredSales} payments={filteredPayments} deliveries={filteredDeliveries} expenses={filteredExpenses} dateFrom={dateFrom} dateTo={dateTo} fmt={fmt} />;
      case "customer":
        return <CustomerReportSection customer={customers.find(c => c.id === selectedId)} sales={filteredSales} payments={filteredPayments} selectedId={selectedId} fmt={fmt} />;
      case "farmer":
        return <FarmerReportSection farmer={farmers.find(f => f.id === selectedId)} deliveries={filteredDeliveries} selectedId={selectedId} fmt={fmt} />;
      case "salesman":
        return <SalesmanReportSection salesman={profiles.find(p => p.id === selectedId)} sales={filteredSales} payments={filteredPayments} selectedId={selectedId} fmt={fmt} />;
    }
  };

  return (
    <div>
      <PageHeader title="Reports">
        {generated && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
            <Button size="sm" variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
          </div>
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
            <Button onClick={() => setGenerated(true)} disabled={needsSelection && !selectedId}>
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
