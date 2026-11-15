/**
 * Re-mounts on every navigation, giving each page a quiet fade-in.
 * (Opacity only — no transform, so it never delays or shifts the photographs.)
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
