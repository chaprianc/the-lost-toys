import { useMemo } from 'react';
import { Toy } from '@/hooks/useToys';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/toy';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package, MapPin, Tag, DollarSign, Calendar, BarChart3, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface AdminAnalyticsProps {
  toys: Toy[];
}

const CHART_COLORS = [
  'hsl(25, 55%, 45%)',
  'hsl(142, 70%, 45%)',
  'hsl(220, 70%, 55%)',
  'hsl(45, 90%, 50%)',
  'hsl(340, 70%, 55%)',
  'hsl(180, 50%, 45%)',
];

const AdminAnalytics = ({ toys }: AdminAnalyticsProps) => {
  const stats = useMemo(() => {
    const available = toys.filter(t => t.status === 'available');
    const sold = toys.filter(t => t.status === 'sold');
    const hidden = toys.filter(t => t.status === 'hidden');
    const totalRevenue = sold.reduce((sum, t) => sum + t.price, 0);
    const avgPrice = toys.length > 0 ? Math.round(toys.reduce((sum, t) => sum + t.price, 0) / toys.length) : 0;

    // Category distribution
    const categoryMap = new Map<string, number>();
    toys.forEach(t => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + 1);
    });
    const categoryData = Array.from(categoryMap.entries()).map(([key, value]) => ({
      name: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS] || key,
      icon: CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS] || '📦',
      value,
    })).sort((a, b) => b.value - a.value);

    // City distribution
    const cityMap = new Map<string, number>();
    toys.forEach(t => {
      cityMap.set(t.city, (cityMap.get(t.city) || 0) + 1);
    });
    const cityData = Array.from(cityMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Timeline (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const timelineMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      timelineMap.set(d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' }), 0);
    }
    toys.forEach(t => {
      const d = new Date(t.created_at);
      if (d >= thirtyDaysAgo) {
        const key = d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' });
        timelineMap.set(key, (timelineMap.get(key) || 0) + 1);
      }
    });
    const timelineData = Array.from(timelineMap.entries()).map(([date, count]) => ({ date, count }));

    // Price distribution
    const priceRanges = [
      { label: '₪0-25', min: 0, max: 25 },
      { label: '₪26-50', min: 26, max: 50 },
      { label: '₪51-100', min: 51, max: 100 },
      { label: '₪101-200', min: 101, max: 200 },
      { label: '₪200+', min: 201, max: Infinity },
    ];
    const priceData = priceRanges.map(r => ({
      name: r.label,
      value: toys.filter(t => t.price >= r.min && t.price <= r.max).length,
    }));

    // Unique sellers
    const uniqueSellers = new Set(toys.map(t => t.seller_phone)).size;

    return { available, sold, hidden, totalRevenue, avgPrice, categoryData, cityData, timelineData, priceData, uniqueSellers };
  }, [toys]);

  const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) => (
    <div className="bg-card rounded-2xl shadow-card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="סה״כ צעצועים" value={toys.length} color="bg-primary/10 text-primary" />
        <StatCard icon={TrendingUp} label="זמינים" value={stats.available.length} color="bg-success/10 text-success" />
        <StatCard icon={Clock} label="ממתינים לאישור" value={stats.hidden.length} color="bg-warning/10 text-warning" />
        <StatCard icon={DollarSign} label="מחיר ממוצע" value={`₪${stats.avgPrice}`} color="bg-secondary/50 text-secondary-foreground" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Tag} label="נמכרו" value={stats.sold.length} color="bg-accent/50 text-accent-foreground" />
        <StatCard icon={DollarSign} label="סה״כ מכירות" value={`₪${stats.totalRevenue.toLocaleString()}`} color="bg-primary/10 text-primary" />
        <StatCard icon={MapPin} label="ערים" value={stats.cityData.length} color="bg-muted text-muted-foreground" />
        <StatCard icon={BarChart3} label="מוכרים ייחודיים" value={stats.uniqueSellers} color="bg-secondary/50 text-secondary-foreground" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            פרסומים ב-30 יום אחרונים
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.timelineData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ direction: 'rtl', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="count" stroke="hsl(25, 55%, 45%)" strokeWidth={2} dot={false} name="פרסומים" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            חלוקה לפי קטגוריה
          </h3>
          <div className="h-48 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie data={stats.categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={70}>
                  {stats.categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ direction: 'rtl', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {stats.categoryData.map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span>{cat.icon} {cat.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{cat.value}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* City Distribution */}
        <div className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            ערים מובילות
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.cityData} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                <Tooltip contentStyle={{ direction: 'rtl', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" fill="hsl(25, 55%, 45%)" radius={[0, 6, 6, 0]} name="צעצועים" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Price Distribution */}
        <div className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            חלוקת מחירים
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.priceData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ direction: 'rtl', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" fill="hsl(142, 70%, 45%)" radius={[6, 6, 0, 0]} name="צעצועים" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
