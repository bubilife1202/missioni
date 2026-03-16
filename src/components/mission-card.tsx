interface Props {
  title: string;
  description: string;
  onSelect: () => void;
}

export function MissionCard({ title, description, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all"
    >
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </button>
  );
}
