"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface SalesChartProps {
  data : {month : string; penjualan: number; transaksi: number}[];
  growthPercent: number;
}

// 2. Konfigurasi Warna & Label (shadcn CSS Variables)
const chartConfig = {
  penjualan: {
    label: "Penjualan (Rp)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function SalesChart({data, growthPercent} : SalesChartProps) {
  const isPositive = growthPercent >= 0
  return (
    <Card className="max-w-full">
      <CardHeader>
        <CardTitle>Grafik Penjualan Bulanan</CardTitle>
        <CardDescription>
          Menampilkan total pendapatan 6 bulan terakhir
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-75 w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}Jt`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(Number(value))
                  }
                />
              }
            />
            <defs>
              <linearGradient id="fillPenjualan" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-penjualan)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-penjualan)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="penjualan"
              type="natural"
              fill="url(#fillPenjualan)"
              fillOpacity={0.4}
              stroke="var(--color-penjualan)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            {isPositive ? "Meningkat" : "Menurun"} {Math.abs(growthPercent)}% bulan ini
                            {isPositive ? (
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-rust" />
                            )}
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">
                            {data[0]?.month} - {data[5]?.month} {new Date().getFullYear()}
                        </div>
                    </div>
                </div>
            </CardFooter>
    </Card>
  );
}