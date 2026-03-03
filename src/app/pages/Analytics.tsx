import { TrendingUp, Users, PlusCircle, Target, BarChart3 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useInvestors } from "../context/InvestorContext";
import { useAuth } from "../context/AuthContext";
import { computeMatchScore } from "../utils/matchScore";
import { allInvestors } from "../data/investors";

export function Analytics() {
  const { crmStatuses } = useInvestors();
  const { user } = useAuth();

  // ---- CRM funnel data (live from context) ----
  const crmBuckets: Record<string, number> = { Active: 0, Contacted: 0, "In Talks": 0, Passed: 0 };
  allInvestors.forEach((inv) => {
    const status = crmStatuses[inv.id] ?? inv.status;
    crmBuckets[status] = (crmBuckets[status] ?? 0) + 1;
  });
  const crmFunnelData = [
    { name: "Active", value: crmBuckets["Active"], color: "#10B981" },
    { name: "Contacted", value: crmBuckets["Contacted"], color: "#2563EB" },
    { name: "In Talks", value: crmBuckets["In Talks"], color: "#F59E0B" },
    { name: "Passed", value: crmBuckets["Passed"], color: "#6B7280" },
  ];
  const hasCRMData = crmBuckets["Contacted"] > 0 || crmBuckets["In Talks"] > 0 || crmBuckets["Passed"] > 0;

  // ---- Match score histogram ----
  const matchBins = [
    { range: "0–20", count: 0 },
    { range: "21–40", count: 0 },
    { range: "41–60", count: 0 },
    { range: "61–80", count: 0 },
    { range: "81–100", count: 0 },
  ];
  allInvestors.forEach((inv) => {
    const score = computeMatchScore(inv, user?.profile ?? null);
    const idx = Math.min(Math.floor(score / 20), 4);
    matchBins[idx].count += 1;
  });
  // Stats data
  const stats = [
    {
      label: "Total Investors",
      value: "247",
      trend: "+12%",
      icon: Users,
      color: "#2563EB",
    },
    {
      label: "Added This Week",
      value: "12",
      trend: "+3",
      icon: PlusCircle,
      color: "#10B981",
    },
    {
      label: "Top Sector",
      value: "SaaS",
      trend: "32%",
      icon: Target,
      color: "#F59E0B",
    },
    {
      label: "Equity vs Debt",
      value: "85:15",
      trend: "Ratio",
      icon: TrendingUp,
      color: "#6B7280",
    },
  ];

  // Chart data
  const sectorData = [
    { sector: "SaaS", count: 78 },
    { sector: "FinTech", count: 65 },
    { sector: "HealthTech", count: 42 },
    { sector: "EdTech", count: 38 },
    { sector: "E-commerce", count: 24 },
  ];

  const monthlyData = [
    { month: "Sep", investors: 185 },
    { month: "Oct", investors: 198 },
    { month: "Nov", investors: 212 },
    { month: "Dec", investors: 225 },
    { month: "Jan", investors: 235 },
    { month: "Feb", investors: 247 },
  ];

  const fundingTypeData = [
    { name: "Equity", value: 210, color: "#2563EB" },
    { name: "Debt", value: 37, color: "#10B981" },
  ];

  const topInstitutions = [
    { name: "Sequoia Capital", investors: 12, deals: 45 },
    { name: "Accel Partners", investors: 10, deals: 38 },
    { name: "Matrix Partners", investors: 8, deals: 32 },
    { name: "Kalaari Capital", investors: 7, deals: 28 },
    { name: "Lightspeed Ventures", investors: 6, deals: 24 },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#111827] mb-2">Analytics</h1>
        <p className="text-[#6B7280]">Insights and trends across your investor database</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-lg border border-[#E5E7EB] p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                <div className="flex items-center gap-1 text-[#10B981] text-sm">
                  <TrendingUp className="h-3 w-3" />
                  <span>{stat.trend}</span>
                </div>
              </div>
              <p className="text-3xl font-semibold text-[#111827] mb-1">{stat.value}</p>
              <p className="text-sm text-[#6B7280]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Sector Distribution - Bar Chart */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-semibold text-[#111827] mb-6">Investors by Sector</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sectorData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis dataKey="sector" type="category" stroke="#6B7280" style={{ fontSize: '12px' }} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
              <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Growth Trend - Line Chart */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-semibold text-[#111827] mb-6">Growth Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
              <Line
                type="monotone"
                dataKey="investors"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Funding Type - Donut Chart */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-semibold text-[#111827] mb-6">Funding Type Distribution</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={fundingTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {fundingTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            {fundingTypeData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-[#6B7280]">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Institutions - Ranked Table */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-semibold text-[#111827] mb-6">Top Institutions</h3>
          <div className="space-y-4">
            {topInstitutions.map((institution, index) => (
              <div
                key={institution.name}
                className="flex items-center justify-between py-3 border-b border-[#E5E7EB] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                    <span className="text-sm font-semibold text-[#2563EB]">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111827]">{institution.name}</p>
                    <p className="text-xs text-[#6B7280]">{institution.investors} investors</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#111827]">{institution.deals}</p>
                  <p className="text-xs text-[#6B7280]">deals</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Match Score Distribution - Histogram */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#111827]">Match Score Distribution</h3>
            {!user?.profile && (
              <span className="text-xs text-[#9CA3AF] bg-[#F3F4F6] px-2 py-1 rounded">
                Complete profile for personalised scores
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={matchBins}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="range" stroke="#6B7280" style={{ fontSize: "12px" }} />
              <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "14px" }}
                formatter={(v: number) => [`${v} investors`, "Count"]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {matchBins.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.range === "81–100" ? "#10B981" : entry.range === "61–80" ? "#2563EB" : entry.range === "41–60" ? "#6366F1" : "#9CA3AF"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CRM Funnel */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-semibold text-[#111827] mb-1">CRM Pipeline</h3>
          <p className="text-sm text-[#6B7280] mb-6">How many investors are at each outreach stage</p>
          {!hasCRMData ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-3">
                <BarChart3 className="h-6 w-6 text-[#9CA3AF]" />
              </div>
              <p className="text-sm font-medium text-[#111827] mb-1">No pipeline activity yet</p>
              <p className="text-xs text-[#9CA3AF] max-w-xs">
                Update investor statuses on the All Investors page to see your pipeline here.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={crmFunnelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: "12px" }} />
                <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "14px" }}
                  formatter={(v: number) => [`${v} investors`, "Count"]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {crmFunnelData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
