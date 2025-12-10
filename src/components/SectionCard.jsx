export default function SectionCard({ children, className = '' }) {
  return (
    <div className={`
      bg-white/5 backdrop-blur-xl border border-white/10
      rounded-2xl shadow-2xl shadow-black/20
      hover:shadow-2xl hover:shadow-dopamine-500/20 hover:border-dopamine-400/50
      transition-all duration-300 hover:-translate-y-1
      ${className}
    `}>
      <div className="p-8">{children}</div>
    </div>
  );
}
