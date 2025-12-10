export default function ActionButton({ icon: Icon, label, onClick, color = 'blue', size = 'large' }) {
  const sizeClasses = {
    large: 'p-8 min-h-[180px]',
    medium: 'p-6 min-h-[140px]',
    small: 'p-4 min-h-[100px]',
  };

  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
    amber: 'bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
    red: 'bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700',
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]} ${colorClasses[color]}
        rounded-[5px] shadow-lg hover:shadow-xl
        flex flex-col items-center justify-center gap-3
        text-white transition-all duration-200 hover:scale-105
        border-2 border-white/20
      `}
    >
      <Icon className="w-12 h-12" />
      <span className="text-lg font-semibold uppercase tracking-wider">
        {label}
      </span>
    </button>
  );
}
