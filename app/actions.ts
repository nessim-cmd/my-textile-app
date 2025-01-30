import prisma from "@/lib/db"
import { Invoice } from "@/type";

const generateUniqueId = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JavaScript
    const prefix = `F-${year}-${month}-`;

    // Find the highest invoice number for the current year and month
    const lastInvoice = await prisma.invoice.findFirst({
        where: {
            id: {
                startsWith: prefix
            }
        },
        orderBy: {
            id: 'desc'
        }
    });

    let sequenceNumber = 1;

    if (lastInvoice) {
        // Extract the sequence number from the last invoice ID
        const lastSequenceNumber = parseInt(lastInvoice.id.slice(-4), 10);
        sequenceNumber = lastSequenceNumber + 1;
    }

    // Format the sequence number to be 4 digits
    const formattedSequenceNumber = String(sequenceNumber).padStart(4, '0');

    // Generate the new invoice ID
    const uniqueId = `${prefix}${formattedSequenceNumber}`;

    return uniqueId;
};

export async function createEmptyInvoice(email: string, name: string) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        const invoiceId = await generateUniqueId() as string

        if (user) {
            const newInvoice = await prisma.invoice.create({
                data: {
                    id: invoiceId,
                    name: name,
                    userId: user?.id,
                    issuerName: "",
                    issuerAddress: "",
                    clientName: "",
                    clientAddress: "",
                    invoiceDate: "",
                    dueDate: "",
                    vatActive: false,
                    vatRate: 20,
                    poidsBrut: "",
                    poidsNet: "",
                    nbrColis: "",
                    volume:"",
                    origineTessuto:""

                }
            })
            return newInvoice
        }
        
    } catch (error) {
        console.error(error)
    }
}




export async function getInvoicesByEmail(email: string) {
    if (!email) return;
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            },
            include: {
                invoices: {
                    include: {
                        lines: true,
                    }
                }
            }
        })
        // Statuts possibles :
        // 1: Brouillon
        // 2: En attente
        // 3: Payée
        // 4: Annulée
        // 5: Impayé
        if (user) {
            const today = new Date()
            const updatedInvoices = await Promise.all(
                user.invoices.map(async (invoice) => {
                    const dueDate = new Date(invoice.dueDate)
                    if (
                        dueDate < today &&
                        invoice.status == 2
                    ) {
                        const updatedInvoice = await prisma.invoice.update({
                            where: { id: invoice.id },
                            data: { status: 5 },
                            include: { lines: true }
                        })
                        return updatedInvoice
                    }
                    return invoice
                })
            )
            return updatedInvoices

        }
    } catch (error) {
        console.error(error)
    }
}

export async function getInvoiceById(invoiceId: string) {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                lines: true
            }
        })
        if (!invoice) {
            throw new Error("Facture non trouvée.");
        }
        return invoice
    } catch (error) {
        console.error(error)
    }
}

export async function updateInvoice(invoice: Invoice) {
    try {
        const existingInvoice = await prisma.invoice.findUnique({
            where: { id: invoice.id },
            include: {
                lines: true
            }
        })

        if (!existingInvoice) {
            throw new Error(`Facture avec l'ID ${invoice.id} introuvable.`);
        }

        await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
                issuerName: invoice.issuerName,
                issuerAddress: invoice.issuerAddress,
                clientName: invoice.clientName,
                clientAddress: invoice.clientAddress,
                invoiceDate: invoice.invoiceDate,
                dueDate: invoice.dueDate,
                vatActive: invoice.vatActive,
                vatRate: invoice.vatRate,
                status: invoice.status,
                poidsBrut: invoice.poidsBrut,
                poidsNet: invoice.poidsNet,
                nbrColis: invoice.nbrColis,
                modePaiment: invoice.modePaiment,
                volume: invoice.volume
            },
        })

        const existingLines = existingInvoice.lines

        const receivedLines = invoice.lines

        const linesToDelete = existingLines.filter(
            (existingLine) => !receivedLines.some((line) => line.id === existingLine.id)
        )

        if (linesToDelete.length > 0) {
            await prisma.invoiceLine.deleteMany({
                where: {
                    id: { in: linesToDelete.map((line) => line.id) }
                }
            })
        }

        for (const line of receivedLines) {
            const existingLine = existingLines.find((l) => l.id == line.id)
            if (existingLine) {
                const hasChanged =
                    line.reference != existingLine.reference ||
                    line.description !== existingLine.description ||
                    line.quantity !== existingLine.quantity ||
                    line.unitPrice !== existingLine.unitPrice;

                if (hasChanged) {
                    await prisma.invoiceLine.update({
                        where: { id: line.id },
                        data: {
                            reference: line.reference,
                            description: line.description,
                            quantity: line.quantity,
                            unitPrice: line.unitPrice,

                        }
                    })
                }
            } else {
                //créer une nouvelle ligne
                await prisma.invoiceLine.create({
                    data: {
                        reference: line.reference,
                        description: line.description,
                        quantity: line.quantity,
                        unitPrice: line.unitPrice,
                        invoiceId: invoice.id
                    }
                })

            }
        }

    } catch (error) {
        console.error(error)
    }
}

export async function deleteInvoice(invoiceId: string) {
    try {
        const deleteInvoice = await prisma.invoice.delete({
            where: { id: invoiceId }
        })
        if (!deleteInvoice) {
            throw new Error("Erreur lors de la suppression de la facture.");
        }
    } catch (error) {
        console.error(error)
    }
}