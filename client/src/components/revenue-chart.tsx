import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", projected: 85000, actual: 78000 },
  { month: "Feb", projected: 92000, actual: 85000 },
  { month: "Mar", projected: 98000, actual: 94000 },
  { month: "Apr", projected: 105000, actual: 102000 },
  { month: "May", projected: 112000, actual: 108000 },
  { month: "Jun", projected: 128000, actual: 125000 },
];

export default function RevenueChart() {
  return (
    <div className="w-full h-[300px]" data-testid="revenue-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis 
            dataKey="month" 
            className="fill-muted-foreground text-xs"
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            className="fill-muted-foreground text-xs"
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="projected" 
            stroke="hsl(var(--chart-1))" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Projected Revenue"
            dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="hsl(var(--chart-2))" 
            strokeWidth={2}
            name="Actual Revenue"
            dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
