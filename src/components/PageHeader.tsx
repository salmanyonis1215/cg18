import { ReactNode } from "react";

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-lg font-bold text-foreground">{title}</h1>
      {children}
    </div>
  );
}
