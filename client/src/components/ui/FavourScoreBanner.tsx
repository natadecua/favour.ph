import { Award, Star } from 'lucide-react'

export function FavourScoreBanner({ score }: { score: number }) {
  return (
    <div className="bg-favour-dark rounded-card p-4 flex items-center justify-between" role="region" aria-label={`Favour Score: ${score.toFixed(2)}`}>
      <div>
        <div className="font-mono text-[42px] font-extrabold text-white leading-none">{score.toFixed(2)}</div>
        <div className="flex gap-0.5 mt-1.5" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className="text-white fill-white" />)}
        </div>
      </div>
      <div className="text-right">
        <Award size={28} className="text-favour-blue ml-auto" aria-hidden="true" />
        <div className="font-mono text-[10px] font-bold text-ink-400 mt-1 tracking-[0.08em]">FAVOUR SCORE</div>
      </div>
    </div>
  )
}
