import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get('email')

        if(!email) return NextResponse.json({error: "Email required"}, {status: 400})
        
        const user = await prisma.user.findUnique({
            where: {email},
            include: {
                exporte:{
                    include:{ lines:true  },
                    orderBy:{ createdAt :'desc'}
                }
            }
        })

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
        
        const today = new Date()
        const updatedExports = await Promise.all(
            user.exporte.map( async (declarationExport) => {
                if (declarationExport.dueDate && new Date(declarationExport.dueDate) < today && declarationExport.status === 2) {
                    return prisma.declarationExport.update({
                        where:{ id: declarationExport.id},
                        data: {status: 5},
                        include: {lines:true}
                    })
                }
                return declarationExport
            })
        )
        return NextResponse.json(updatedExports)
    } catch (error) {
        console.log(error)
    }
}


export async function POST(request :NextRequest) {
    try {
        const {email, name} = await request.json()

        const user = await prisma.user.findUnique({where: {email}})

        if (!user) return NextResponse.json({error :"User Not Found. "}, {status:404})

        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2,'0')
        const prefix = `E-${year}-${month}-`

        const lastExport = await prisma.declarationExport.findFirst({
            where: {id :{startsWith: prefix}},
            orderBy:{id: 'desc'}
        })

        const sequenceNumber = lastExport ?
         parseInt(lastExport.id.slice(-4), 10) + 1 : 1
        const exportId = `${prefix}${String(sequenceNumber).padStart(4, '0')}`

        const newExport = await prisma.declarationExport.create({
            data:{
                id: exportId,
                name,
                userId: user.id,
                clientName:"",
                exportDate:"",
                dueDate:"",
                vatActive: false,
                vatRate: 20,
                poidsBrut:"",
                poidsNet:"",
                nbrColis:"",
                volume:"",
                origineTessuto:"",


            }
        })
        return NextResponse.json(newExport)
    } catch (error) {
        console.log(error)
    }
}