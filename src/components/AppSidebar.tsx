import {
  Truck, ShoppingCart, CreditCard, Users, Sprout, Package, LayoutDashboard, LogOut, FileBarChart, Receipt,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const adminItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Deliveries", url: "/deliveries", icon: Truck },
  { title: "Sales", url: "/sales", icon: ShoppingCart },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Farmers", url: "/farmers", icon: Sprout },
  { title: "Products", url: "/products", icon: Package },
  { title: "Expenses", url: "/expenses", icon: Receipt },
  { title: "Reports", url: "/reports", icon: FileBarChart },
];

const salesmanItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Sales", url: "/sales", icon: ShoppingCart },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Customers", url: "/customers", icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { isAdmin, profile, signOut, role } = useAuth();

  const items = isAdmin ? adminItems : salesmanItems;

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div>
            <h1 className="text-sm font-bold text-sidebar-primary-foreground">VBMS</h1>
            <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">Market Ledger</p>
          </div>
        )}
        {collapsed && <span className="text-sm font-bold text-sidebar-primary-foreground">V</span>}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="text-sidebar-foreground/70 hover:text-sidebar-primary-foreground hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="mb-2">
            <p className="text-xs font-medium text-sidebar-primary-foreground truncate">{profile?.name}</p>
            <p className="text-[10px] text-sidebar-foreground/50 uppercase">{role}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-primary-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && "Sign Out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
