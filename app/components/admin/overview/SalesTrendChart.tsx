"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { formatCount } from "@/app/components/admin/orders/formatters";
import { formatNaira } from "@/app/utils/product";
import type { AdminOverviewSalesPoint } from "@/redux/types";
import { rise } from "./motion";

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
] as const;

const HEIGHT = 240;
const MARGIN = { top: 16, right: 16, bottom: 30, left: 52 };

/** 1,250,000 -> "₦1.3M", 42,000 -> "₦42K" */
function compactNaira(n: number) {
  if (n >= 1_000_000) return `₦${+(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${+(n / 1_000).toFixed(1)}K`;
  return `₦${n}`;
}

function formatDay(ymd: string, long = false) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    ...(long ? { weekday: "short" } : {}),
    month: "short",
    day: "numeric",
  });
}

/** A round step (1, 2, 5 x 10^n) so the y axis reads 0 / 20K / 40K, never 0 / 17.3K. */
function niceScale(max: number) {
  if (max <= 0) return { step: 1, top: 1 };
  const raw = max / 4;
  const exp = 10 ** Math.floor(Math.log10(raw));
  const f = raw / exp;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * exp;
  return { step, top: step * Math.ceil(max / step) };
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Daily sales as one line with a soft wash under it. Hover (or touch) for a day's figures. */
export default function SalesTrendChart({ points }: { points: AdminOverviewSalesPoint[] }) {
  const [days, setDays] = useState<(typeof RANGES)[number]["days"]>(30);
  const [hover, setHover] = useState<number | null>(null);
  const [wrapRef, width] = useWidth<HTMLDivElement>();

  const data = useMemo(() => points.slice(-days), [points, days]);
  const totalSales = data.reduce((sum, p) => sum + p.sales, 0);
  const totalOrders = data.reduce((sum, p) => sum + p.orders, 0);
  const hasSales = totalSales > 0;

  const { step, top } = useMemo(
    () => niceScale(Math.max(0, ...data.map((p) => p.sales))),
    [data],
  );

  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;
  const x = (i: number) =>
    MARGIN.left + (data.length > 1 ? (i / (data.length - 1)) * plotW : plotW / 2);
  const y = (v: number) => MARGIN.top + plotH - (v / top) * plotH;

  const line = data.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p.sales).toFixed(1)}`).join(" ");
  const area = data.length > 1 ? `${line} L${x(data.length - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z` : "";

  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(v);

  // Three date labels on a phone, five on a wider card
  const labelCount = Math.min(data.length, width < 480 ? 3 : 5);
  const labelIdx =
    labelCount <= 1
      ? [0]
      : Array.from({ length: labelCount }, (_, k) => Math.round((k / (labelCount - 1)) * (data.length - 1)));

  function onMove(e: PointerEvent<SVGSVGElement>) {
    if (data.length === 0 || plotW === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - rect.left - MARGIN.left) / plotW;
    setHover(Math.min(data.length - 1, Math.max(0, Math.round(rel * (data.length - 1)))));
  }

  const active = hover !== null ? data[hover] : null;
  const tipLeft = hover !== null ? Math.min(Math.max(x(hover), 80), Math.max(80, width - 80)) : 0;

  return (
    <motion.section
      variants={rise}
      aria-labelledby="sales-trend-heading"
      className="rounded-3xl bg-white p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="sales-trend-heading" className="text-lg font-semibold text-neutral-900">
            Sales trend
          </h2>
          <p className="mt-1 text-sm text-neutral-500">Daily sales from paid orders.</p>
        </div>

        <div role="group" aria-label="Time range" className="flex rounded-xl bg-neutral-100 p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              aria-pressed={days === r.days}
              onClick={() => {
                setDays(r.days);
                setHover(null);
              }}
              className={`h-8 rounded-lg px-3 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-corisio-blue ${
                days === r.days ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-5 text-2xl font-bold text-neutral-900 sm:text-[28px]">{formatNaira(totalSales)}</p>
      <p className="mt-1 text-xs text-neutral-500">
        {formatCount(totalOrders)} {totalOrders === 1 ? "order" : "orders"} in the last {days} days
      </p>

      <div ref={wrapRef} className="relative mt-6" style={{ height: HEIGHT }}>
        {!hasSales ? (
          <div className="flex h-full items-center justify-center rounded-2xl bg-neutral-50 px-6 text-center text-sm text-neutral-500">
            No sales recorded in this period yet. They will show up here as orders are paid.
          </div>
        ) : (
          width > 0 && (
            <>
              <svg
                width={width}
                height={HEIGHT}
                role="img"
                aria-label={`Daily sales over the last ${days} days. Total ${formatNaira(totalSales)}.`}
                onPointerMove={onMove}
                onPointerLeave={() => setHover(null)}
                className="touch-pan-y"
              >
                {/* Gridlines + y axis */}
                {ticks.map((v) => (
                  <g key={v}>
                    <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(v)} y2={y(v)} className="stroke-neutral-200" strokeWidth="1" />
                    <text x={MARGIN.left - 8} y={y(v)} textAnchor="end" dominantBaseline="middle" className="fill-neutral-500 text-[11px]">
                      {compactNaira(v)}
                    </text>
                  </g>
                ))}

                {/* X axis dates */}
                {labelIdx.map((i, k) => (
                  <text
                    key={`${data[i].date}-${k}`}
                    x={x(i)}
                    y={HEIGHT - 8}
                    textAnchor={k === 0 && labelCount > 1 ? "start" : k === labelIdx.length - 1 && labelCount > 1 ? "end" : "middle"}
                    className="fill-neutral-500 text-[11px]"
                  >
                    {formatDay(data[i].date)}
                  </text>
                ))}

                {area && <path d={area} className="fill-corisio-500/10" />}
                <path d={line} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-corisio-500" />

                {/* Crosshair, then the dot: the latest day by default, the hovered day on hover */}
                {hover !== null && (
                  <line x1={x(hover)} x2={x(hover)} y1={MARGIN.top} y2={y(0)} className="stroke-neutral-300" strokeWidth="1" />
                )}
                {(() => {
                  const i = hover ?? data.length - 1;
                  return (
                    <circle cx={x(i)} cy={y(data[i].sales)} r="5" strokeWidth="2" className="fill-corisio-500 stroke-white" />
                  );
                })()}
              </svg>

              {active && hover !== null && (
                <div
                  role="status"
                  className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs shadow-lg"
                  style={{ left: tipLeft, top: Math.max(0, y(active.sales) - 64) }}
                >
                  <p className="font-semibold text-neutral-900">{formatDay(active.date, true)}</p>
                  <p className="mt-0.5 text-neutral-700">{formatNaira(active.sales)}</p>
                  <p className="text-neutral-500">
                    {formatCount(active.orders)} {active.orders === 1 ? "order" : "orders"}
                  </p>
                </div>
              )}
            </>
          )
        )}
      </div>

      {/* The same numbers for screen readers */}
      <table className="sr-only">
        <caption>Daily sales, last {days} days</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Sales</th>
            <th scope="col">Orders</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.date}>
              <th scope="row">{formatDay(p.date, true)}</th>
              <td>{formatNaira(p.sales)}</td>
              <td>{p.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.section>
  );
}
