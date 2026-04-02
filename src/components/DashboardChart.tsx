import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const data = [
  { date: '01/10', vendas: 450 },
  { date: '02/10', vendas: 890 },
  { date: '03/10', vendas: 320 },
  { date: '04/10', vendas: 1200 },
  { date: '05/10', vendas: 2100 },
  { date: '06/10', vendas: 1800 },
  { date: '07/10', vendas: 2500 },
]

const chartConfig = {
  vendas: { label: 'Vendas', color: 'hsl(var(--primary))' },
}

export default function DashboardChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full mt-4">
      <AreaChart data={data} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="fillVendas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-vendas)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-vendas)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Area
          type="monotone"
          dataKey="vendas"
          stroke="var(--color-vendas)"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#fillVendas)"
        />
      </AreaChart>
    </ChartContainer>
  )
}
