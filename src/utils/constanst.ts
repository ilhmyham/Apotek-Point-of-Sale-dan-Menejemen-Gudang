// src/utils/constants.ts
/**
 * Nilai sentinel untuk StockMovement.expiredDate pada transaksi SALE.
 * Menandakan "N/A / tidak berlaku" — barang sudah keluar gudang,
 * sehingga tanggal kedaluwarsa tidak relevan.
 *
 * WORKAROUND: expiredDate saat ini wajib (required) di schema Prisma.
 * Jangka panjang: ubah jadi `expiredDate DateTime?` lalu pakai null.
 *
 * PENTING: laporan/pengecekan barang akan expired HARUS mengecualikan nilai ini.
 */
export const EXPIRED_DATE_NOT_APPLICABLE = new Date("9999-12-31");