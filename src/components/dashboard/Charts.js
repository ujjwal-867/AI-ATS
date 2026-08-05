"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function Charts({ stats }) {
  const pieData = [
    {
      name: "Pending",
      value: stats.pending,
    },
    {
      name: "Shortlisted",
      value: stats.shortlisted,
    },
    {
      name: "Rejected",
      value: stats.rejected,
    },
  ];

  const barData = [
    {
      name: "Candidates",
      total: stats.totalCandidates,
    },
  ];

  const COLORS = [
    "#eab308",
    "#22c55e",
    "#ef4444",
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-2 mt-10">

      <div className="bg-slate-900 rounded-3xl p-6">
        <h2 className="text-white text-xl mb-4">
          Candidate Status
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              outerRadius={100}
              label
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-900 rounded-3xl p-6">
        <h2 className="text-white text-xl mb-4">
          Total Candidates
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid stroke="#333" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />

            <Bar
              dataKey="total"
              fill="#8b5cf6"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}