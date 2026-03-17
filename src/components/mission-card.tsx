interface Props {
  title: string;
  description: string;
  onSelect: () => void;
}

export function MissionCard({ title, description, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all shadow-sm"
    >
      <h3 className="font-semibold mb-1 text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </button>
  );
}
