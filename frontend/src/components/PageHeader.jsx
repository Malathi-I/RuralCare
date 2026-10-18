/**
 * Consistent page heading with an optional lead paragraph and action row.
 * Used by every page so the visual hierarchy stays the same across the app.
 */
export default function PageHeader({ title, subtitle, children }) {
  return (
    <header className="page-header">
      <h1 className="page-header__title">{title}</h1>

      {subtitle && <p className="page-header__subtitle">{subtitle}</p>}

      {children && <div className="page-header__actions">{children}</div>}
    </header>
  );
}