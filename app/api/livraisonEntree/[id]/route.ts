import prisma from "@/lib/db";
import { LivraisonEntree } from "@/type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    {params}: {params : {id : string}}
) {
    try {
        const livraisonEntree = await prisma.livraisonEntree.findUnique({
            where :{id : params.id},
            include: {
                client: true,
                lines: true
            }
        })

        return livraisonEntree
            ? NextResponse.json(livraisonEntree)
            : NextResponse.json({error: 'LivraisonEntree Not Found '}, {status: 404})

    } catch (error) {
        console.log(error)
        return NextResponse.json(
            {
                error: "Failed to fetch LivraisonEntree."
            },
            {
                status : 500
            }
        )
    }
}


export async function PUT(
    request: NextRequest,
    {params}: {params : {id: string}}
) {
    try {
        const livraisonEntreeData = await request.json()

        await prisma.livraisonEntree.update({
            where: {id: params.id},
            data:{
                name: livraisonEntreeData.name,
                clientId: livraisonEntreeData.clientId,
                clientName: livraisonEntreeData.clientName,
                livraisonDate: livraisonEntreeData.livraisonDate
            }
        })

        const existingLines = await prisma.livraisonEntreeLine.findMany({
            where:{livraisonEntreeId: params.id}
        })

        const linesToDelete = existingLines.filter(el => 
            !livraisonEntreeData.lines.some((l:LivraisonEntree)=> l.id === el.id)
        )

        if(linesToDelete.length > 0) {
            await prisma.livraisonEntreeLine.deleteMany({
                where:{id: {in:linesToDelete.map(l => l.id)}}
            })
        }


        for (const line of livraisonEntreeData.lines) {
            if (existingLines.some(el => el.id === line.id)) {
                await prisma.livraisonEntreeLine.update({
                    where : {id: line.id},
                    data: {
                        modele: line.modele,
                        commande: line.commande,
                        description: line.description,
                        quantityReçu: line.quantityReçu,
                        quantityTrouvee: line.quantityTrouvee
                    }
                })
            }else{
                await prisma.livraisonEntreeLine.create({
                    data:{
                        ...line,
                        livraisonEntreeId: params.id
                    }
                })
            }
        }

        return NextResponse.json({success : true})
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            {error: 'Failed to update LivraisonEntree.'},
            {status:500}
        )
    }
}


export async function DELETE(
    request :NextRequest,
    {params}: {params : {id: string}}
) {
    try {
        await prisma.livraisonEntree.delete({
            where: {id: params.id}
        })
        return NextResponse.json({success : true})
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            {error:"Failed to delete LivraisonEntree."},
            {status: 500}
        )
    }
}