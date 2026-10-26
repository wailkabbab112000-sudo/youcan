import React, { useState, useMemo } from 'react';
import { ShoppingBag, DollarSign, Calendar, Info } from 'lucide-react';
import { Order } from '../../types';

export type TimeRangeType = 'today' | 'month' | 'year' | 'custom';

interface AnalyticsChartProps {
  orders: Order[];
  currency: string;
  timeRange: TimeRangeType;
  customStartDate?: string;
  customEndDate?: string;
  lang?: 'ar' | 'fr' | 'en';
  dashboardColor?: string;
}

interface DataPoint {
  id: string;
  label: string;
  fullLabel: string;
  isToday: boolean;
  ordersCount: number;
  revenue: number;
  ordersList: Order[];
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  orders,
  currency,
  timeRange,
  customStartDate = '',
  customEndDate = '',
  lang = 'fr',
  dashboardColor = '#2563eb',
}) => {
  const [activeMetric, setActiveMetric] = useState<'orders' | 'revenue'>('orders');
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  const theme = dashboardColor || '#2563eb';

  // Capitalize first letter helper (e.g. 'jeudi 17 septembre' -> 'Jeudi 17 septembre')
  const formatFrenchDate = (date: Date, options: Intl.DateTimeFormatOptions): string => {
    const str = date.toLocaleDateString('fr-FR', options);
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Compute points according to the selected timeRange
  const dataPoints: DataPoint[] = useMemo(() => {
    const now = new Date();

    // 1. TODAY: 6 time slots of 4 hours
    if (timeRange === 'today') {
      const intervals = [
        { id: '00', label: '00h - 04h', start: 0, end: 4 },
        { id: '04', label: '04h - 08h', start: 4, end: 8 },
        { id: '08', label: '08h - 12h', start: 8, end: 12 },
        { id: '12', label: '12h - 16h', start: 12, end: 16 },
        { id: '16', label: '16h - 20h', start: 16, end: 20 },
        { id: '20', label: '20h - 24h', start: 20, end: 24 },
      ];

      return intervals.map((inv) => {
        const slotOrders = orders.filter((o) => {
          if (!o.createdAt) return false;
          const d = new Date(o.createdAt);
          if (isNaN(d.getTime())) return false;
          const isSameDay =
            d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate();
          if (!isSameDay) return false;
          const h = d.getHours();
          return h >= inv.start && h < inv.end;
        });

        const rev = slotOrders
          .filter((o) => o.status !== 'annule')
          .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

        return {
          id: inv.id,
          label: inv.label.split(' - ')[0],
          fullLabel: `Aujourd'hui, ${inv.label}`,
          isToday: true,
          ordersCount: slotOrders.length,
          revenue: rev,
          ordersList: slotOrders,
        };
      });
    }

    // 2. THIS MONTH: Days from the 1st of the month until today (or all days of month)
    if (timeRange === 'month') {
      const points: DataPoint[] = [];
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();
      
      // Calculate how many days to display: either last 14 days or from day 1 to today
      const daysCount = Math.max(currentDay, 10);
      const startDay = Math.max(1, currentDay - 13);

      for (let day = startDay; day <= Math.min(daysCount, currentDay); day++) {
        const targetDate = new Date(currentYear, currentMonth, day, 0, 0, 0);

        const slotOrders = orders.filter((o) => {
          if (!o.createdAt) return false;
          const d = new Date(o.createdAt);
          if (isNaN(d.getTime())) return false;
          return (
            d.getFullYear() === currentYear &&
            d.getMonth() === currentMonth &&
            d.getDate() === day
          );
        });

        const rev = slotOrders
          .filter((o) => o.status !== 'annule')
          .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

        const isCurrentDay = day === currentDay;
        const monthShort = targetDate.toLocaleDateString('fr-FR', { month: 'short' });

        points.push({
          id: `m-day-${day}`,
          label: isCurrentDay ? 'Aujourd’hui' : `${day} ${monthShort}`,
          fullLabel: formatFrenchDate(targetDate, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          isToday: isCurrentDay,
          ordersCount: slotOrders.length,
          revenue: rev,
          ordersList: slotOrders,
        });
      }

      return points;
    }

    // 3. THIS YEAR: 12 months
    if (timeRange === 'year') {
      const monthsFr = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

      const currentYear = now.getFullYear();
      const currentMonthIdx = now.getMonth();

      return Array.from({ length: 12 }).map((_, mIdx) => {
        const slotOrders = orders.filter((o) => {
          if (!o.createdAt) return false;
          const d = new Date(o.createdAt);
          if (isNaN(d.getTime())) return false;
          return d.getFullYear() === currentYear && d.getMonth() === mIdx;
        });

        const rev = slotOrders
          .filter((o) => o.status !== 'annule')
          .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

        const mName = monthsFr[mIdx];
        const targetMonthDate = new Date(currentYear, mIdx, 1);

        return {
          id: `yr-m-${mIdx}`,
          label: mName,
          fullLabel: formatFrenchDate(targetMonthDate, { month: 'long', year: 'numeric' }),
          isToday: mIdx === currentMonthIdx,
          ordersCount: slotOrders.length,
          revenue: rev,
          ordersList: slotOrders,
        };
      });
    }

    // 4. CUSTOM DATE RANGE (date personnalisée)
    if (timeRange === 'custom') {
      const start = customStartDate ? new Date(customStartDate) : new Date(now.getTime() - 7 * 86400000);
      const end = customEndDate ? new Date(customEndDate) : new Date(now);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.min(31, Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))));

      const points: DataPoint[] = [];

      for (let i = 0; i < diffDays; i++) {
        const targetDate = new Date(start);
        targetDate.setDate(start.getDate() + i);
        targetDate.setHours(0, 0, 0, 0);

        const slotOrders = orders.filter((o) => {
          if (!o.createdAt) return false;
          const d = new Date(o.createdAt);
          if (isNaN(d.getTime())) return false;
          return (
            d.getFullYear() === targetDate.getFullYear() &&
            d.getMonth() === targetDate.getMonth() &&
            d.getDate() === targetDate.getDate()
          );
        });

        const rev = slotOrders
          .filter((o) => o.status !== 'annule')
          .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

        const isCurrentDay =
          targetDate.getFullYear() === now.getFullYear() &&
          targetDate.getMonth() === now.getMonth() &&
          targetDate.getDate() === now.getDate();

        const monthShort = targetDate.toLocaleDateString('fr-FR', { month: 'short' });

        points.push({
          id: `custom-day-${i}`,
          label: isCurrentDay ? 'Aujourd’hui' : `${targetDate.getDate()} ${monthShort}`,
          fullLabel: formatFrenchDate(targetDate, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          isToday: isCurrentDay,
          ordersCount: slotOrders.length,
          revenue: rev,
          ordersList: slotOrders,
        });
      }

      return points;
    }

    return [];
  }, [orders, timeRange, customStartDate, customEndDate]);

  // Aggregated totals
  const totalOrders = useMemo(
    () => dataPoints.reduce((sum, p) => sum + p.ordersCount, 0),
    [dataPoints]
  );
  const totalRevenue = useMemo(
    () => dataPoints.reduce((sum, p) => sum + p.revenue, 0),
    [dataPoints]
  );

  // Maximum scale calculation for Y-Axis and bar heights
  const maxVal = useMemo(() => {
    if (activeMetric === 'orders') {
      const maxCount = Math.max(...dataPoints.map((p) => p.ordersCount), 0);
      return Math.max(maxCount <= 2 ? 3 : maxCount + 1, 4);
    } else {
      const maxRev = Math.max(...dataPoints.map((p) => p.revenue), 0);
      return Math.max(maxRev <= 200 ? 500 : Math.ceil((maxRev * 1.25) / 100) * 100, 500);
    }
  }, [dataPoints, activeMetric]);

  // Active point for preview/tooltip
  const displayPoint =
    hoveredPoint ||
    dataPoints.find((p) => p.ordersCount > 0) ||
    dataPoints.find((p) => p.isToday) ||
    dataPoints[dataPoints.length - 1];

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200/80 shadow-xs space-y-6">
      {/* Top Header: Title & Metric Toggle ONLY (no duplicate date range buttons!) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span style={{ backgroundColor: theme }} className="w-2.5 h-2.5 rounded-full animate-pulse"></span>
            <h3 className="text-base sm:text-lg font-black text-gray-900">
              Statistiques des Ventes & Commandes
            </h3>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Graphique interactif actualisé en temps réel avec chaque commande
          </p>
        </div>

        {/* Metric Selector Toggle: Commandes vs Chiffre d'affaires */}
        <div className="inline-flex bg-gray-100 p-1 rounded-2xl border border-gray-200/70 self-start sm:self-auto">
          <button
            onClick={() => setActiveMetric('orders')}
            style={activeMetric === 'orders' ? { color: theme } : undefined}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeMetric === 'orders'
                ? 'bg-white shadow-xs ring-1 ring-black/5'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Commandes</span>
          </button>
          <button
            onClick={() => setActiveMetric('revenue')}
            style={activeMetric === 'revenue' ? { color: theme } : undefined}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeMetric === 'revenue'
                ? 'bg-white shadow-xs ring-1 ring-black/5'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Chiffre d'affaires</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Chart Container */}
      <div className="space-y-3">
        {/* Active hovered point info pill */}
        <div className="flex items-center justify-between min-h-[34px] px-1">
          <div className="flex items-center gap-2">
            <Calendar style={{ color: theme }} className="w-3.5 h-3.5" />
            <span className="text-xs font-bold text-gray-700">
              {displayPoint ? displayPoint.fullLabel : '—'}
            </span>
            {displayPoint?.isToday && (
              <span style={{ backgroundColor: theme }} className="text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                Aujourd’hui
              </span>
            )}
          </div>

          <div className="text-xs font-black">
            {displayPoint ? (
              <span
                style={{ color: theme, backgroundColor: `${theme}15`, borderColor: `${theme}40` }}
                className="border px-2.5 py-1 rounded-xl"
              >
                {activeMetric === 'orders' ? (
                  <>
                    {displayPoint.ordersCount}{' '}
                    {displayPoint.ordersCount === 1 ? 'commande' : 'commandes'}
                    {displayPoint.revenue > 0 && ` (${displayPoint.revenue.toLocaleString('fr-FR')} ${currency})`}
                  </>
                ) : (
                  <>
                    {displayPoint.revenue.toLocaleString('fr-FR')} {currency}
                    {displayPoint.ordersCount > 0 && ` (${displayPoint.ordersCount} cmd)`}
                  </>
                )}
              </span>
            ) : null}
          </div>
        </div>

        {/* Visual Chart Stage with bars, heights, tooltips, and grid */}
        <div className="relative h-64 w-full bg-gradient-to-b from-gray-50/60 to-white rounded-2xl border border-gray-200/90 flex flex-col justify-end p-4 pt-8 overflow-hidden select-none">
          {/* Grid background reference lines with numerical values */}
          <div className="absolute inset-x-4 top-8 bottom-12 flex flex-col justify-between pointer-events-none z-0">
            {[1, 0.75, 0.5, 0.25, 0].map((step, i) => {
              const val = Math.round(maxVal * step);
              return (
                <div key={i} className="flex items-center w-full gap-2">
                  <span className="text-[9px] font-mono font-bold text-gray-400 w-10 text-right shrink-0">
                    {val}
                  </span>
                  <div className="border-b border-dashed border-gray-200/80 w-full"></div>
                </div>
              );
            })}
          </div>

          {/* Interactive Bars Container */}
          <div className="relative z-10 flex items-end justify-between h-44 gap-1 sm:gap-1.5 px-1 pl-10 sm:pl-12 w-full">
            {dataPoints.map((point) => {
              const val = activeMetric === 'orders' ? point.ordersCount : point.revenue;
              const hasOrders = point.ordersCount > 0;
              // Percentage calculation (clamped between 4% minimum visibility and 100%)
              const heightPct = val === 0 ? 4 : Math.min(100, Math.max(14, Math.round((val / maxVal) * 100)));
              const isHovered = hoveredPoint?.id === point.id;

              return (
                <div
                  key={point.id}
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => setHoveredPoint(point)}
                  className="flex-1 min-w-0 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                >
                  {/* Real-time Order Badge above bar when orders exist */}
                  {hasOrders && (
                    <div
                      className={`absolute -top-7 z-30 transition-all duration-200 ${
                        isHovered ? 'scale-110' : 'scale-100'
                      }`}
                    >
                      <div
                        style={{ backgroundColor: theme }}
                        className="text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-md whitespace-nowrap flex items-center gap-0.5"
                      >
                        <span>{point.ordersCount}</span>
                        <span className="text-[8px] opacity-85">cmd</span>
                      </div>
                      <div style={{ backgroundColor: theme }} className="w-1.5 h-1.5 rotate-45 mx-auto -mt-0.5"></div>
                    </div>
                  )}

                  {/* The Bar */}
                  <div className="w-full flex justify-center items-end h-full">
                    <div
                      style={{
                        height: `${heightPct}%`,
                        ...(hasOrders
                          ? isHovered
                            ? { backgroundColor: theme, boxShadow: `0 10px 15px -3px ${theme}50` }
                            : { backgroundColor: theme }
                          : isHovered
                          ? {}
                          : point.isToday
                          ? { backgroundColor: `${theme}40`, borderTop: `2px solid ${theme}` }
                          : {})
                      }}
                      className={`w-full max-w-[32px] rounded-t-lg transition-all duration-300 ${
                        hasOrders
                          ? 'shadow-sm'
                          : isHovered
                          ? 'bg-gray-300'
                          : point.isToday
                          ? ''
                          : 'bg-gray-200/70 hover:bg-gray-300'
                      }`}
                    ></div>
                  </div>

                  {/* Label below bar */}
                  <div className="pt-2 text-center w-full">
                    <span
                      style={{
                        color: isHovered ? theme : point.isToday ? theme : undefined,
                      }}
                      className={`text-[9px] sm:text-[10px] font-bold block truncate transition-colors ${
                        isHovered
                          ? 'font-black'
                          : point.isToday
                          ? 'font-extrabold'
                          : hasOrders
                          ? 'text-gray-900 font-extrabold'
                          : 'text-gray-400'
                      }`}
                    >
                      {point.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer insight / legend */}
        {totalOrders === 0 ? (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200/70 text-gray-500 text-xs">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              Aucune commande enregistrée sur cette période. Dès qu'un client passe commande, elle apparaîtra ici en temps réel.
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
            <span className="flex items-center gap-1.5">
              <span style={{ backgroundColor: theme }} className="w-2.5 h-2.5 rounded-sm inline-block"></span>
              <span className="font-medium">
                Commandes affichées :{' '}
                <strong className="text-gray-900">
                  {totalOrders} {totalOrders === 1 ? 'commande' : 'commandes'} ({totalRevenue.toLocaleString('fr-FR')} {currency})
                </strong>
              </span>
            </span>

            <span className="text-[11px] text-gray-400 hidden sm:inline">
              Survolez ou cliquez sur une barre pour afficher les détails
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
