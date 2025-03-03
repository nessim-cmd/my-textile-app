"use client"

import { UserButton } from '@clerk/nextjs'

import { Bell, Layers } from 'lucide-react'
import Link from 'next/link'

import React from 'react'

const Navbar = () => {

  return (
    <div className='border-b border-base-300 px-5 md:px-[10%] py-4 '>
      <div className='flex justify-between items-center'>
      <div className='flex items-center'>
            <div className='bg-accent-content text-accent rounded-full p-2'>
                <Layers className='h-6 w-6'/>
            </div>
            <span className='ml-3 font-bold text-2xl italic'>
                  <Link href="/">MS <span className='text-accent'>Tailors</span></Link>  
            </span>
      </div>
        <div className='flex space-x-4 items-center'>
        <Bell className='mr-6'/>
            <UserButton/>
        </div>
      </div>
      <div></div>
    </div>
  )
}

export default Navbar
