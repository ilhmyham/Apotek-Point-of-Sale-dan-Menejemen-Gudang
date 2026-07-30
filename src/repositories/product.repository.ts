import prisma from '@/lib/prisma';
import type { Prisma, Product } from '@/generated/prisma/client';

export const productRepository = {
  async findAll():Promise<Product[]> {
    return prisma.product.findMany();
  },

  async findById(id: number): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
    });
  },

  async search(name : string): Promise<Product[]> {
    return prisma.product.findMany({
      where: {
        namaProduct: {
          contains: name,
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
  }
}