"use client"

import { ChevronDown, Scissors, UserRoundPenIcon, DatabaseZapIcon, Calendar, LayoutDashboard, Eye, CircleArrowOutDownRight, CircleArrowOutUpLeft, Inbox } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar"
import { useUser } from "@clerk/nextjs"

// Define all possible items
const allItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    subItems: [
      { icon: Inbox, title: "Dashboard", url: "/dashboard" },
      { title: "Users", url: "/admin/users" },
      { title: "Ajouter Employee", url: "/production-time/" },
    ],
  },
  {
    title: "Creation Entree",
    icon: CircleArrowOutDownRight,
    subItems: [
      { title: "Declaration Import", url: "/import" },
      { title: "Bon Livraison Entree", url: "/livraisonEntree" },
    ],
  },
  {
    title: "Client",
    icon: UserRoundPenIcon,
    subItems: [
      { title: "Client", url: "/client" },
      { title: "Client-modeles", url: "/client-model" },
    ],
  },
  {
    title: "Creation Sortee",
    icon: CircleArrowOutUpLeft,
    subItems: [
      { title: "Declaration Export", url: "/exporte" },
      { title: "Bon Livraison", url: "/livraison" },
      { title: "Factures", url: "/invoice" },
    ],
  },
  {
    title: "Coupe",
    icon: Scissors,
    subItems: [
      { title: "Fiches Coupe", url: "/fiche-coupe" },
      { title: "Detaills Coupe", url: "/coupes" },
    ],
  },
  {
    title: "Suivi",
    icon: Eye,
    subItems: [
      { title: "Suivi Declarations", url: "/etat-import-export" },
      { title: "Suivi Livraisons", url: "/etat-import-export-livraison" },
      { title: "Fiche Production", url: "/fiche-production" },
      { title: "Planning", url: "/planning" },
      { title: "Production", url: "/production-time/entries" },
     

    ],
  },
  {
    title: "Stock",
    icon: DatabaseZapIcon,
    subItems: [
      { title: "Fournisseur", url: "/fournisseur" },
      { title: "Bon Commande", url: "/commande" },
      { title: "Listes des Manques", url: "/liste-manque" },
      { title: "Accessoires", url: "/accessoires" }
    ],
  },
  {
    title: "Calendar",
    icon: Calendar,
    url: "/calendar"
  },
]

// Function to filter items based on role
const getItemsForRole = (role: string | undefined) => {
  if (!role) return []; // Return empty array if no role

  switch (role.toUpperCase()) {
    case "ADMIN":
      return allItems;
    case "COUPEUR":
      return allItems.filter(item => 
        ["Coupe", "Suivi", "Stock", "Calendar"].includes(item.title)
      );
    case "CHEF":
      return allItems.filter(item => 
        ["Suivi", "Stock", "Calendar"].includes(item.title)
      );
    case "USER":
      return allItems.filter(item => 
        ["Suivi"].includes(item.title)
      );
    default:
      return []; // Return empty array for unknown roles
  }
}

export function AppSidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set([""]))
  const { user, isLoaded } = useUser()
  const [userRole, setUserRole] = useState<string | undefined>(undefined)

  // Fetch user role from Prisma using Clerk user ID
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user || !isLoaded) return;

      try {
        const response = await fetch(`/api/user-role?clerkUserId=${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user role');
        }
        
        const data = await response.json();
        setUserRole(data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole("USER"); // Fallback to USER role
      }
    };

    fetchUserRole();
  }, [user, isLoaded]);

  // Update open menus based on current path
  useEffect(() => {
    const newOpenMenus = new Set(openMenus)
    const items = getItemsForRole(userRole)
    
    items.forEach(item => {
      if (item.subItems?.some(subItem => subItem.url === pathname)) {
        newOpenMenus.add(item.title)
      }
    })

    setOpenMenus(newOpenMenus)
  }, [pathname, userRole])

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => {
      const newSet = new Set(prev)
      if (newSet.has(title)) {
        newSet.delete(title)
      } else {
        newSet.add(title)
      }
      return newSet
    })
  }

  const items = getItemsForRole(userRole)

  if (!isLoaded || !userRole) {
    return <div>Loading sidebar...</div> // Or your preferred loading state
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-bold items-center flex justify-center text-2xl">MS Tailors</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                if (item.subItems) {
                  const isOpen = openMenus.has(item.title)
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
                              style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
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
                  )
                }
                
                // Direct link for Calendar
                if (item.url) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a 
                          href={item.url}
                          className={`flex items-center gap-2 w-full ${
                            pathname === item.url ? "font-bold text-primary" : ""
                          }`}
                        >
                          <item.icon />
                          <span className="font-bold uppercase">{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                return null
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}