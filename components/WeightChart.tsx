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
    // Transform data for the chart
    // We need an array of objects where each object is a date, and keys are player names
    const getData = () => {
        const dataMap = new Map<string, any>();

        players.forEach(player => {
            // Add initial weight
            const startDate = player.weightHistory[0]?.date || new Date().toISOString();
            const startKey = new Date(startDate).toLocaleDateString();

            if (!dataMap.has(startKey)) {
                dataMap.set(startKey, { date: startKey });
            }
            dataMap.get(startKey)[player.name] = player.initialWeight;

            // Add history
            player.weightHistory.forEach(record => {
                const dateKey = new Date(record.date).toLocaleDateString();
                if (!dataMap.has(dateKey)) {
                    dataMap.set(dateKey, { date: dateKey });
                }
                dataMap.get(dateKey)[player.name] = record.weight;
            });
        });

        return Array.from(dataMap.values()).sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    };

    const data = getData();
    const colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        fontSize={12}
                        tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="#64748b" fontSize={12} domain={['auto', 'auto']} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                    />
                    <Legend />
                    {players.map((player, index) => (
                        <Line
                            key={player.id}
                            type="monotone"
                            dataKey={player.name}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                            connectNulls
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
