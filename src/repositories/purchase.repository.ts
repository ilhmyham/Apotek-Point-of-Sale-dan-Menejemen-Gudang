import prisma from "@/lib/prisma";
import { Prisma, Purchase } from "@/generated/prisma/client"


type TransactionClient = Prisma.TransactionClient;

export const PurchaseRepository = {
    async findAll():Promise<Purchase[]>{
        return prisma.purchase.findMany({
            include : {purchaseDetails: true, supplier: true}
        });        
    },

    async findById(id: number):Promise<Purchase | null>{
        return prisma.purchase.findUnique({
            where : {id},
            include: { purchaseDetails: true, supplier: true}
        });
    },

    async countTodayPurchase(tx: TransactionClient, startOfDay: Date, endOfday: Date): Promise<number>{
        return tx.purchase.count({
            where:{
                createdAt:{
                    gte: startOfDay,
                    lte: endOfday
                }
            }
        });
    },

    async create(tx: TransactionClient, data: Prisma.PurchaseCreateInput):Promise<Purchase>{
        return tx.purchase.create({data})
    },

    async createDetail(tx: TransactionClient, data: Prisma.PurchaseDetailCreateInput): Promise<void>{
        await tx.purchaseDetail.create({data})
    },

    async incrementProductStock(tx: TransactionClient, productId: number, jumlah: number):Promise<void>{
        await tx.product.update({
            where : {id: productId},
            data: {stok : {increment: jumlah}}
        });
    },

    async createStockMovement(
        tx: TransactionClient,
        data: Prisma.StockMovementCreateInput    
    ): Promise<void>{
        await tx.stockMovement.create({ data })
    }
}