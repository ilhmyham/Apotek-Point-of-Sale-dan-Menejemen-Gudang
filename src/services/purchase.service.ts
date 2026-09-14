import prisma from "@/lib/prisma";
import { PurchaseRepository } from "@/repositories/purchase.repository";
import { Purchase, ReferenceType } from "@/generated/prisma/client";
import { NotFoundError } from "@/errors/not-found.error";
import { CreatePurchaseInput } from "@/validations/purchase.validation";
import { BadRequestError } from "@/errors/bad-request.error";


function generatePurchaseNumber(sequence: number, date: Date): string{
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const urutan = String(sequence + 1).padStart(4, "0");
    return `PO-${yyyy}${mm}${dd}-${urutan}`;
}

export const PurchaseService = {
    async findAll():Promise<Purchase[]>{
        return PurchaseRepository.findAll();
    },

    async findById(id: number):Promise<Purchase>{
        const purchase = await PurchaseRepository.findById(id)
        if(!purchase){
            throw new NotFoundError("Purchase tidak ditemukan")
        }

        return purchase;
    },

    async create(data: CreatePurchaseInput, userId: number): Promise<Purchase>{
        const supplier = await prisma.supplier.findUnique({
            where : {id: data.supplierId}
        })

        if(!supplier){
            throw new BadRequestError("supplier tidak ditemukan")
        }

        for(const item of data.items){
            const product = await prisma.product.findUnique({
                where : {id : item.productId}
            });

            if(!product){
                throw new BadRequestError(`produk dengan id ${item.productId} tidak ditemukan`)
            }
        }

        const totalHarga = data.items.reduce(
            (sum, item) => sum + item.jumlah * item.hargaPerUnit, 0
        );

        return prisma.$transaction(async (tx)=>{
            const now = new Date();
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));  
            const endOfDay = new Date(now.setHours(23, 59, 59, 999));

            const todayCount = await PurchaseRepository.countTodayPurchase(tx, startOfDay, endOfDay);
            const purchaseNumber = generatePurchaseNumber(todayCount, new Date());

            const purchase = await PurchaseRepository.create(tx, {
                purchaseNumber,
                totalHarga,
                supplier: {connect: {id: data.supplierId}},
                user : {connect:{id: userId}},
            });

            for(const item of data.items){
                const subtotal  = item.jumlah * item.hargaPerUnit;

                await PurchaseRepository.createDetail(tx, {
                    purchase : {connect: {id:purchase.id}},
                    product : {connect:{id:item.productId}},
                    jumlah : item.jumlah,
                    hargaPerUnit : item.hargaPerUnit,
                    totalHarga : subtotal
                });

                await PurchaseRepository.incrementProductStock(tx, item.productId, item.jumlah);

                await PurchaseRepository.createStockMovement(tx, {
                    product: {connect:{id:item.productId}},
                    quantity: item.jumlah,
                    keterangan : `pembelian - ${purchaseNumber}`,
                    expiredDate : item.expiredDate,
                    referenceId : purchase.id,
                    referenceType : ReferenceType.PURCHASE
                });
                
            }

            return purchase;
        });
    },
};