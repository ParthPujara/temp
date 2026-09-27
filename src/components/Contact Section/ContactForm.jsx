import { useState } from 'react'
import { LuSend } from 'react-icons/lu'
import { CONTACT_EMAIL } from '../../lib/contact'

const fieldClass =
  'w-full rounded-xl border border-border-subtle bg-surface/70 px-4 py-3 text-text-primary backdrop-blur-sm transition-colors outline-none placeholder:text-text-muted focus:border-cyan-primary'

// No backend: submitting opens the visitor's email app with the message ready to send
export default function ContactForm() {
  const [opened, setOpened] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = data.get('name')
    const subject = `Portfolio contact from ${name}`
    const body = `${data.get('message')}\n\n— ${name} (${data.get('email')})`
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setOpened(true)
  }

  return (
    // pointer-events-auto: the page layer ignores the mouse so drags reach the 3D scene
    <form onSubmit={handleSubmit} className="pointer-events-auto mt-8 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm text-text-secondary">Name</span>
          <input name="name" required autoComplete="name" placeholder="Your name" className={fieldClass} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-text-secondary">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={fieldClass}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm text-text-secondary">Message</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Tell me about your project…"
          className={`${fieldClass} resize-none`}
        />
      </label>

      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-xl bg-cyan-primary px-6 py-3 font-semibold text-void transition-colors hover:bg-cyan-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-primary"
      >
        Send message
        <LuSend className="h-4 w-4" />
      </button>

      {opened && (
        <p role="status" className="text-sm text-text-secondary">
          Your email app should open with the message ready to send.
        </p>
      )}
    </form>
  )
}
