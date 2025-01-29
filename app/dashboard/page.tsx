
import { addUserToDatabase } from '@/services/userService'
import {  UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'

import React from 'react'

export default async function PageDashboard() {
    

    const user = await currentUser()

    if(user){
        const fullName = `${user.firstName} ${user.lastName}` || ""
        const email = user.emailAddresses[0].emailAddress || ""
        await addUserToDatabase(user.id,fullName,email  )
    }

  return (
    <div className='space-x-5 flex flex-col justify-center items-center h-screen'>
      <h2>hello in dashboard</h2> 
        <h1>{user?.firstName}</h1>
        <h2 className='font-bold'>{user?.emailAddresses[0].emailAddress}</h2>
        <div className='bg-blue-400 hover:bg-slate-500 p-3 text-xl rounded-md'>
        <UserButton/>
        </div>
        
      
    </div>
  )
}


