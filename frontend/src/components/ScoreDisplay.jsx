export default function ScoreDisplay({ evaluation, isCompleted }) {
  if (!isCompleted && evaluation.innovationScore === null) {
    return (
      <p className="text-xs text-gray-600 italic font-mono">
        Scores hidden until results are announced
      </p>
    )
  }

  const avg = (
    (evaluation.innovationScore + evaluation.impactScore + evaluation.technicalScore) / 3
  ).toFixed(1)

  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        { label: 'Innovation', val: evaluation.innovationScore },
        { label: 'Impact', val: evaluation.impactScore },
        { label: 'Technical', val: evaluation.technicalScore },
        { label: 'Average', val: avg, highlight: true },
      ].map(({ label, val, highlight }) => (
        <div key={label} className="text-center bg-hack-bg border border-hack-border rounded-lg py-2">
          <div className={`font-mono text-xl font-bold ${highlight ? 'text-white' : 'text-hack-cyan'}`}>
            {val}
          </div>
          <div className="text-xs text-gray-600 mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  )
}
