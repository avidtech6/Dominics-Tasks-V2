import React from 'react';
import { ExternalLink, FolderOpen } from 'lucide-react';

/**
 * M06 — Resources.
 * Per recipe.md §A: static list of family resource links. No state, no behaviour.
 * Per codex.md §B: links defined in component file.
 *
 * This is a placeholder/seed surface. Real resource management is a future feature.
 */

interface ResourceLink {
  href: string;
  label: string;
  description?: string;
  category?: string;
}

const RESOURCE_LINKS: ResourceLink[] = [
  {
    href: 'https://www.khanacademy.org/',
    label: 'Khan Academy',
    description: 'Free educational videos and exercises across many subjects.',
    category: 'Learning',
  },
  {
    href: 'https://www.bbc.co.uk/bitesize',
    label: 'BBC Bitesize',
    description: 'UK-aligned study support for primary and secondary.',
    category: 'Learning',
  },
  {
    href: 'https://www.oxfordowl.co.uk/',
    label: 'Oxford Owl',
    description: 'Free e-books and reading support for ages 3–11.',
    category: 'Reading',
  },
  {
    href: 'https://www.nationalgeographic.com/',
    label: 'National Geographic Kids',
    description: 'Science, nature, and geography articles for kids.',
    category: 'Science',
  },
  {
    href: 'https://www.coolmath.com/',
    label: 'CoolMath',
    description: 'Math games and puzzles for kids.',
    category: 'Maths',
  },
];

const Resources: React.FC = () => {
  return (
    <div className="resources-page" style={{ padding: '1.5rem', maxWidth: 720, margin: '0 auto' }}>
      <h1
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1.5rem',
          fontWeight: 600,
          marginBottom: '0.25rem',
        }}
      >
        <FolderOpen size={24} aria-hidden="true" />
        Resources
      </h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        Family resource links. Bookmark anything useful — these open in a new tab.
      </p>

      <ul className="resources-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none', padding: 0 }}>
        {RESOURCE_LINKS.map((link) => (
          <li
            key={link.href}
            className="resources-list-item"
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              padding: '1rem',
              background: '#fff',
            }}
          >
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              data-resource-href={link.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#2563eb',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '1rem',
              }}
            >
              <ExternalLink size={16} aria-hidden="true" />
              {link.label}
            </a>
            {link.description && (
              <p style={{ marginTop: '0.25rem', color: '#475569', fontSize: '0.875rem' }}>
                {link.description}
              </p>
            )}
            {link.category && (
              <span
                style={{
                  display: 'inline-block',
                  marginTop: '0.5rem',
                  padding: '0.125rem 0.5rem',
                  background: '#eef2ff',
                  color: '#4338ca',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                {link.category}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Resources;
