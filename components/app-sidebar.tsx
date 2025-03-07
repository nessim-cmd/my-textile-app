"use client"

import { Inbox, ChevronDown, Scissors, UserRoundPenIcon, Blocks, SendToBack, DatabaseZapIcon, Calendar, LayoutDashboard } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar"

const items = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    subItems: [
      { title: "Dashboard", url: "/dashboard" },
      { title: "Users", url: "/admin/users" },
    ],
  },
  {
    title: "Creation Entree",
    icon: Blocks,
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
    icon: Inbox,
    subItems: [
      { title: "Declaration Export", url: "/exporte" },
      { title: "Bon Livraison", url: "/livraison" },
      { title: "Factures", url: "/invoice" },
    ],
  },
  {
    title: "Coupe ",
    icon: Scissors,
    subItems: [
      { title: "Fiche Etiquage Coupe", url: "/coupe" },
    ],
  },
  {
    title: "Suivi ",
    icon: SendToBack,
    subItems: [
      { title: "Suivi Declarations", url: "/etat-import-export" },
      { title: "Suivi Livraisons", url: "/etat-import-export-livraison" },
      { title: "Planning", url: "/planning" }
    ],
  },
  {
    title: "Stock ",
    icon: DatabaseZapIcon,
    subItems: [
      { title: "Fournisseur", url: "/fournisseur" },
      { title: "Bon Commande", url: "/commande" }
    ],
  },
  {
    title: "Calendar ",
    icon: Calendar,
    url: "/calendar" // Direct URL property instead of subItems
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set([""]))

  useEffect(() => {
    const newOpenMenus = new Set(openMenus)
    
    items.forEach(item => {
      if (item.subItems?.some(subItem => subItem.url === pathname)) {
        newOpenMenus.add(item.title)
      }
    })

    setOpenMenus(newOpenMenus)
  }, [pathname])

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

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
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