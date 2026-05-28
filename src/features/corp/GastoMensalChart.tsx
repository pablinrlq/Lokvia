import { formatCurrency } from '@/lib/utils'

interface Bar {
  mes: string
  gasto: number
  orcamento?: number
}

interface Props {
  data: Bar[]
  height?: number
}

// Gráfico de barras inline em SVG — evita peso do recharts e
// segue a paleta editorial forest/lime.
export function GastoMensalChart({ data, height = 220 }: Props) {
  const max = Math.max(
    1,
    ...data.flatMap((d) => [d.gasto, d.orcamento ?? 0]),
  )
  const barW = 36
  const gap = 28
  const w = data.length * (barW + gap)
  const padY = 28

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width={w}
        height={height}
        className="block"
        aria-label="Gasto mensal"
      >
        {/* Linha de base */}
        <line
          x1={0}
          x2={w}
          y1={height - padY}
          y2={height - padY}
          stroke="#0D2B1E"
          strokeOpacity={0.1}
        />

        {data.map((d, i) => {
          const x = i * (barW + gap) + gap / 2
          const h = ((height - padY * 2) * d.gasto) / max
          const y = height - padY - h

          const orc = d.orcamento ?? 0
          const orcY = orc
            ? height - padY - ((height - padY * 2) * orc) / max
            : null

          return (
            <g key={d.mes}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={6}
                fill="#1D4A35"
              />
              {orcY !== null && (
                <line
                  x1={x - 4}
                  x2={x + barW + 4}
                  y1={orcY}
                  y2={orcY}
                  stroke="#AECF4A"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              )}
              <text
                x={x + barW / 2}
                y={height - padY + 14}
                textAnchor="middle"
                fontSize={10}
                fill="#0D2B1E"
                opacity={0.6}
              >
                {d.mes}
              </text>
              <title>
                {d.mes}: {formatCurrency(d.gasto)}
                {orc ? ` / orçamento ${formatCurrency(orc)}` : ''}
              </title>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
