"use client";

import { Inbox, ChevronDown, Scissors, UserRoundPenIcon, Blocks, SendToBack, DatabaseZapIcon, Calendar, LayoutDashboard } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import prisma from "@/lib/db"; // Import Prisma client
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { CustomTrigger } from "@/components/CustomTrigger";

// Define all items
const allItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Creation Entree", icon: Blocks, subItems: [
    { title: "Declaration Import", url: "/import" },
    { title: "Bon Livraison Entree", url: "/livraisonEntree" },
  ]},
  { title: "Client", icon: UserRoundPenIcon, subItems: [
    { title: "Client", url: "/client" },
    { title: "Client-modeles", url: "/client-model" },
  ]},
  { title: "Creation Sortee", icon: Inbox, subItems: [
    { title: "Declaration Export", url: "/exporte" },
    { title: "Bon Livraison", url: "/livraison" },
    { title: "Factures", url: "/invoice" },
  ]},
  { title: "Coupe", icon: Scissors, subItems: [
    { title: "Fiche Etiquage Coupe", url: "/coupe" },
  ]},
  { title: "Suivi", icon: SendToBack, subItems: [
    { title: "Suivi Declarations", url: "/etat-import-export" },
    { title: "Suivi Livraisons", url: "/etat-import-export-livraison" },
    { title: "Planning", url: "/planning" },
  ]},
  { title: "Stock", icon: DatabaseZapIcon, subItems: [
    { title: "Fournisseur", url: "/fournisseur" },
    { title: "Bon Commande", url: "/commande" },
  ]},
  { title: "Calendar", icon: Calendar, url: "/calendar" },
];

// Function to filter items based on role
const getFilteredItems = (role: string | undefined) => {
  console.log("Filtering items for role (raw):", role);
  const normalizedRole = role?.toUpperCase() || "UNKNOWN";
  console.log("Filtering items for role (normalized):", normalizedRole);
  switch (normalizedRole) {
    case "ADMIN":
      console.log("Returning all items for ADMIN");
      return allItems;
    case "COUPEUR":
      console.log("Returning Coupe items for COUPEUR");
      return allItems.filter(item => item.title === "Coupe");
    case "CHEF":
      console.log("Returning Suivi items for CHEF");
      return allItems.filter(item => item.title === "Suivi");
    case "USER":
      console.log("Returning Dashboard and Calendar for USER");
      return allItems.filter(item => item.title === "Dashboard" || item.title === "Calendar");
    default:
      console.log("Role not recognized, returning empty array for role:", normalizedRole);
      return [];
  }
};

export function AppSidebar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set([""]));

  // Get role from Clerk and fallback to Prisma
  const getRole = async () => {
    if (!user || !isLoaded) return undefined;
    const clerkRole = user.publicMetadata?.role as string | undefined;
    console.log("Clerk role:", clerkRole);
    if (clerkRole) return clerkRole;

    // Fallback to Prisma if Clerk metadata is missing
    const dbUser = await prisma.user.findUnique({ where: { clerkUserId: user.id } });
    console.log("Prisma role:", dbUser?.role);
    return dbUser?.role || "UNKNOWN";
  };

  // Memoize role fetch
  const role = useMemo(() => (isLoaded ? getRole() : undefined), [isLoaded, user?.id]);
  // Memoize filtered items with resolved role
  const items = useMemo(async () => {
    const resolvedRole = await role;
    return isLoaded ? getFilteredItems(resolvedRole) : [];
  }, [isLoaded, role]);

  useEffect(() => {
    if (!isLoaded) return;

    items.then(resolvedItems => {
      const shouldUpdate = resolvedItems.some(item =>
        item.subItems?.some(subItem => subItem.url === pathname)
      );

      if (shouldUpdate) {
        const newOpenMenus = new Set<string>();
        resolvedItems.forEach(item => {
          if (item.subItems?.some(subItem => subItem.url === pathname)) {
            newOpenMenus.add(item.title);
          }
        });
        setOpenMenus(prev => {
          if (Array.from(prev).sort().join() !== Array.from(newOpenMenus).sort().join()) {
            return newOpenMenus;
          }
          return prev;
        });
      }
    });
  }, [pathname, items, isLoaded]);

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  if (!isLoaded) {
    return <div>Loading sidebar...</div>;
  }

  return (
    <Sidebar>
      <div className="font-bold ml-[273px] flex justify-center items-center mt-[73px]">
        <CustomTrigger />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(async () => {
                const resolvedItems = await items;
                return resolvedItems.map((item) => {
                  if (item.subItems) {
                    const isOpen = openMenus.has(item.title);
                    return (
                      <Collapsible
                        key={item.title}
                        open={isOpen}
                        onOpenChange={() => toggleMenu(item.title)}
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton>
                              <item.icon />
                              <span className="font-bold uppercase">{item.title}</span>
                              <ChevronDown
                                className="ml-auto h-4 w-4 transition-transform duration-200"
                                style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                              />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                        </SidebarMenuItem>
                        <CollapsibleContent>
                          <div className="ml-8">
                            {item.subItems.map((subItem) => (
                              <SidebarMenuItem key={subItem.title}>
                                <SidebarMenuButton asChild>
                                  <a
                                    href={subItem.url}
                                    className={pathname === subItem.url ? "font-bold text-primary" : ""}
                                  >
                                    <span>{subItem.title}</span>
                                  </a>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  }

                  if (item.url) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <a
                            href={item.url}
                            className={`flex items-center gap-2 w-full ${pathname === item.url ? "font-bold text-primary" : ""}`}
                          >
                            <item.icon />
                            <span className="font-bold uppercase">{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  return null;
                });
              })()}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}