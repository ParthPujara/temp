import { FaGithub, FaLinkedinIn } from 'react-icons/fa6'
import { LuMail } from 'react-icons/lu'
import { CONTACT_EMAIL } from '../../lib/contact'

// TODO: replace the LinkedIn and GitHub URLs with your profile links
const links = [
  { label: 'Email', href: `mailto:${CONTACT_EMAIL}`, icon: LuMail },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/your-profile', icon: FaLinkedinIn },
  { label: 'GitHub', href: 'https://github.com/your-username', icon: FaGithub },
]

export default function SocialLinks() {
  return (
    <ul className="flex items-center justify-center gap-4">
      {links.map(({ label, href, icon: Icon }) => (
        <li key={label}>
          {/* pointer-events-auto: the hero text layer ignores clicks so drags reach the 3D model */}
          <a
            href={href}
            aria-label={label}
            title={label}
            {...(href.startsWith('http') && { target: '_blank', rel: 'noopener noreferrer' })}
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle bg-surface/60 text-text-secondary backdrop-blur-sm transition-colors hover:border-cyan-primary hover:text-cyan-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-primary"
          >
            <Icon className="h-5 w-5" />
          </a>
        </li>
      ))}
    </ul>
  )
}
