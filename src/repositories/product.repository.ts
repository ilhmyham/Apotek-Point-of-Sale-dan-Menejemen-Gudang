import prisma from '@/lib/prisma';
import type { Prisma, Product } from '@/generated/prisma/client';

export const ProductRepository = {
  async findAll():Promise<Product[]> {
    return prisma.product.findMany();
  },

  async findById(id: number): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
    });
  },

  async search(keyword : string): Promise<Product[]> {
    return prisma.product.findMany({
      where: {
        status: true,
        namaProduct: {
          contains: keyword,
          mode: 'insensitive',
        }
    }
    });
  },

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({
      data,
    });
  },

  async update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
    });
  },

  async delete(id: number): Promise<void> {
    await prisma.product.delete({
      where: { id },
    });
  },

  async deactivate(id: number): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: { status: false },
    });
  },

}


// export interface ProductRepository {
//   findAll(): Promise<Product[]>;
//   findById(id: number): Promise<Product | null>;
//   search(name: string): Promise<Product[]>;
//   create(data: Prisma.ProductCreateInput): Promise<Product>;
//   update(id: number, data: Prisma.ProductUpdateInput): Promise<Product>;
//   delete(id: number): Promise<void>;
  
// }