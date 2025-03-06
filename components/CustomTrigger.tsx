"use client"

import { useSidebar } from "@/components/ui/sidebar"
import { AlignStartVertical } from "lucide-react"

export function CustomTrigger() {
  const { toggleSidebar } = useSidebar()

  return <button onClick={toggleSidebar}>
    <span className="font-bold ml-[255px] flex justify-center items-center mt-16 ">
    <AlignStartVertical className="font-bold size-8 text-red-500" />
    </span>
  </button>
}
