interface StatCard {
  label: string;
  value: string;
  suffix: string;
  color?: string;
}

interface Props {
  cards: StatCard[];
}

export default function StatCards({ cards }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, suffix, color }) => (
        <div key={label} className="bg-surface-container-low border border-outline-variant p-5 rounded-xl">
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className={`font-headline-lg text-headline-lg font-bold ${color || "text-on-surface"}`}>{value}</span>
            <span className="font-label-md text-label-md text-on-surface-variant">{suffix}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
