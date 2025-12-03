"use client";


export default function ChartBar({
  data,
  labels,
  height = 120,
}: {
  data: number[];
  labels?: string[];
  height?: number;
}) {
  const max = Math.max(1, ...data);
  const barWidth = 20;
  const gap = 12;
  const width = data.length * (barWidth + gap) + gap;

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="min-w-full">
        {data.map((v, i) => {
          const barHeight = Math.round((v / max) * (height - 24));
          const x = i * (barWidth + gap) + gap;
          const y = height - barHeight - 20;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                className="fill-indigo-500/80 hover:fill-indigo-600 transition-colors"
              />
              {labels?.[i] && (
                <text
                  x={x + barWidth / 2}
                  y={height - 6}
                  textAnchor="middle"
                  className="fill-gray-500 text-[10px]"
                >
                  {labels[i]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
