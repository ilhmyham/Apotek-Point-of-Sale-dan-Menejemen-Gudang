import prisma from "@/lib/prisma";
import { SaleRepository } from "@/repositories/sale.repository";
import { Sale, ReferenceType } from "@/generated/prisma/client";
import { CreateSaleInput } from "@/validations/sale.validation";
import { BadRequestError } from "@/errors/bad-request.error";
import { NotFoundError } from "@/errors/not-found.error";
import { EXPIRED_DATE_NOT_APPLICABLE } from "@/utils/constanst";

function generateInvoiceNumber(sequence: number, date: Date):string{
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1 ).padStart(2, "0")
    const dd = String(date.getDate()).padStart(2, "0");
    const urutan = String(sequence + 1).padStart(4, "0");
    return `INV-${yyyy}${mm}${dd}-${urutan}`;
};

export const SaleService = {
    async findAll(): Promise<Sale[]>{
        return SaleRepository.findAll();
    },

    async findById(id: number):Promise<Sale>{
        const sale = await SaleRepository.findById(id);

        if(!sale){
            throw new NotFoundError("Sale tidak ditemukan");
        }

        return sale;
    },

    async create(data: CreateSaleInput, userId: number):Promise<Sale>{
        return prisma.$transaction(async(tx)=>{
            let totalHarga = 0;

            const itemsWithPrice: {productId : number, jumlah : number, harga: number, subtotal:number}[] = [];

            for (const item of data.items){
                const product = await SaleRepository.findProductForUpdate(tx, item.productId);
                
                if(!product){
                    throw new BadRequestError(`Produk dengan id ${item.productId} tidak ditemukan`);                    
                };

                if(!product.status){
                    throw new BadRequestError(`Produk "${product.namaProduct}" sedang tidak aktif`);                    
                };

                if(product.stok < item.jumlah){
                    throw new BadRequestError(
                        `Stok produk "${product.namaProduct}" tidak cukup (tersedia: ${product.stok}, diminta: ${item.jumlah})`
                    );
                };

                const harga = Number(product.harga);
                const subtotal = harga * item.jumlah;
                totalHarga += subtotal;

                itemsWithPrice.push({productId: item.productId, jumlah: item.jumlah, harga, subtotal});                
            }

            if (data.bayar < totalHarga){
                throw new BadRequestError(`Uang bayar tidak cukup (total: ${totalHarga}, dibayar: ${data.bayar})`);
            }

            const kembalian = data.bayar - totalHarga;

            const now = new Date();
            const startOfDay = new Date(now.setHours(0,0,0,0));
            const endOfDay = new Date(now.setHours(23, 59, 59, 999));
            const todayCount = await SaleRepository.countTodaySales(tx, startOfDay, endOfDay);
            const invoiceNumber = generateInvoiceNumber(todayCount, new Date());

            const sale = await SaleRepository.create(tx, {
                bayar: data.bayar,
                kembalian,
                totalHarga,
                invoiceNumber,
                user: {connect: {id:userId}},
            });

            for(const item of itemsWithPrice){
                await SaleRepository.createDetail(tx, {
                    sale : {connect:{id:sale.id}},
                    product : {connect: {id: item.productId}},
                    jumlah : item.jumlah,
                    harga : item.harga,
                    subtotal: item.subtotal
                });   
                
                await SaleRepository.decrementProductStock(tx, item.productId, item.jumlah);

                await SaleRepository.createStockMovement(tx, {
                    product: {connect: {id: item.productId}},
                    quantity : -item.jumlah,
                    keterangan : `Penjualan - ${invoiceNumber}`,
                    expiredDate : EXPIRED_DATE_NOT_APPLICABLE,
                    referenceId : sale.id,
                    referenceType : ReferenceType.SALE,
                });                
            }

            return sale;

        })
    }
}