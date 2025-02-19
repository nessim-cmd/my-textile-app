import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const {searchParams} = new URL(request.url)
        const email = searchParams.get('email')

        if(!email) return NextResponse.json({error: 'Email required'}, {status:400})

        const user = await prisma.user.findUnique({
            where :{email},
            include: {
                livraisonsEntry: {
                    include: {
                        lines: true,
                        client: true,
                    },
                    orderBy: {createdAt: 'desc'}
                }
            }
        })

        if (!user) return NextResponse.json({error:'user Not Found .'}, {status: 404})
        
        return NextResponse.json(user.livraisonsEntry)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Failed to fetch livraisonsEntry" }, { status: 500 })
    }
}




export async function POST(request: NextRequest) {
    try {
        const {email, name} = await request.json()

        const user = await prisma.user.findUnique({where: {email}})
        if(!user) return NextResponse.json({error:"User Not Found. "}, {status: 404})
        
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const prefix = `L.E${year}-${month}-`

        const lastLivraisonEntree = await prisma.livraisonEntree.findFirst({
            where: {id: {startsWith: prefix}},
            orderBy: {id: 'desc'}
        })

        const sequenceNumber = lastLivraisonEntree ? parseInt(lastLivraisonEntree.id.slice(-4),10) + 1 : 1

        const livraisonEntreeId = `${prefix}${String(sequenceNumber).padStart(4, '0')}`

        const newLivraisonEntree = await prisma.livraisonEntree.create({
            data:{
                id: livraisonEntreeId,
                name,
                userId: user.id,
                clientName:"",
                livraisonDate:""
                
            }
        })
        return NextResponse.json(newLivraisonEntree)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Failed to create livraisonsEntry" }, { status: 500 })
    }
}