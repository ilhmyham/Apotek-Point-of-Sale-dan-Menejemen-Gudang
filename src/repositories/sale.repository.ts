import prisma from "@/lib/prisma";
import { Prisma, Sale, Product, SaleDetail } from "@/generated/prisma/client";

type TransactionClient = Prisma.TransactionClient;

export const SaleRepository = {
    async findAll():Promise<Sale[]>{
        return prisma.sale.findMany({
            include: {saleDetails: true, user:true}
        });
    },

    async findById(id: number):Promise<Sale | null>{
        return prisma.sale.findUnique({
            where: {id},
            include: {saleDetails: true, user: true}
        })
    },

    async countTodaySales(tx: TransactionClient, startOfday: Date, endOfDay: Date):Promise<number>{
        return tx.sale.count({
            where : {
                createdAt : {
                    gte : startOfday,
                    lte : endOfDay
                }
            }
        })
    },

    async findProductForUpdate(tx: TransactionClient, productId: number):Promise<Product | null>{
        return tx.product.findUnique({
            where : {id: productId}
        });
    },

    async create(tx: TransactionClient, data: Prisma.SaleCreateInput):Promise<Sale>{
        return tx.sale.create({data});
    },

    async createDetail(tx : TransactionClient, data:Prisma.SaleDetailCreateInput):Promise<void>{
        await tx.saleDetail.create({data});
    },

    async decrementProductStock(tx: TransactionClient, productId: number, jumlah: number):Promise<void>{
        await tx.product.update({
            where: {id: productId},
            data : {stok : {decrement: jumlah}}
        });
    },

    async createStockMovement(tx: TransactionClient, data:Prisma.StockMovementCreateInput):Promise<void>{
        await tx.stockMovement.create({
            data
        })
    }
}