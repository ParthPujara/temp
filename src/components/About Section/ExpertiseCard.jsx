export default function ExpertiseCard({ title, description, tags }) {
  return (
    // Translucent so the wireframe shows through behind the card
    <article className="rounded-2xl border border-border-subtle bg-surface/70 p-5 backdrop-blur-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      {/* Description only on large screens so the content fits inside the wireframe */}
      <p className="mt-2 hidden text-sm leading-relaxed text-text-secondary lg:block">
        {description}
      </p>

      <ul className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-border-active bg-elevated px-3 py-1 text-xs text-cyan-bright"
          >
            {tag}
          </li>
        ))}
      </ul>
    </article>
  )
}
