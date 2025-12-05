import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Player } from '../types';

interface WeightChartProps {
    players: Player[];
}

export const WeightChart: React.FC<WeightChartProps> = ({ players }) => {
    // Transform data for chart
    // We need to merge all player histories into a single timeline
    const allDates = new Set<string>();
    players.forEach(p => {
        p.weightHistory.forEach(h => {
            allDates.add(h.date.split('T')[0]);
        });
    });

    const sortedDates = Array.from(allDates).sort();

    const data = sortedDates.map(date => {
        const entry: any = { date };
        players.forEach(p => {
            // Find weight for this date or use last known weight
            // Ideally we interpolate, but for now let's find exact or previous
            const history = p.weightHistory.find(h => h.date.startsWith(date));
            if (history) {
                entry[p.name] = history.weight;
            } else {
                // Simple fill forward logic could go here, but let's leave gaps for now or just not show
                // For a smoother chart, we might want to fill forward
                const previous = p.weightHistory
                    .filter(h => h.date < date)
                    .sort((a, b) => b.date.localeCompare(a.date))[0];
                if (previous) {
                    entry[p.name] = previous.weight;
                }
            }
        });
        return entry;
    });

    const colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#eab308'];

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#a8a29e"
                        tick={{ fill: '#a8a29e', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.substring(5)} // Show MM-DD
                    />
                    <YAxis
                        stroke="#a8a29e"
                        tick={{ fill: '#a8a29e', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(28, 25, 23, 0.9)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                        }}
                        itemStyle={{ color: '#e7e5e4' }}
                        labelStyle={{ color: '#a8a29e', marginBottom: '0.5rem' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    {players.map((player, index) => (
                        <Line
                            key={player.id}
                            type="monotone"
                            dataKey={player.name}
                            stroke={colors[index % colors.length]}
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: '#0c0a09' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            connectNulls
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
