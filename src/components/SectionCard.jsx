export default function SectionCard({ children, className = '' }) {
  return (
    <div
      className={`
        bg-white
        border border-black/10
        rounded-[5px]
        px-6 py-5 md:px-7 md:py-6
        shadow-sm
        ${className}
      `}
    >
      {children}
    </div>
  );
}
