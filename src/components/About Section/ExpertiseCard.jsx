export default function ExpertiseCard({ title, description, tags }) {
  return (
    <article className="rounded-2xl border border-border-subtle bg-surface p-6 transition-colors hover:border-cyan-deep">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-3 leading-relaxed text-text-secondary">{description}</p>

      <ul className="mt-5 flex flex-wrap gap-2">
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
