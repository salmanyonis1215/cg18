interface StatCardProps {
  label: string;
  value: string;
  variant?: "default" | "success" | "warning" | "destructive";
}

export function StatCard({ label, value, variant = "default" }: StatCardProps) {
  const valueColor = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  }[variant];

  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-bold font-mono ${valueColor}`}>{value}</p>
    </div>
  );
}
