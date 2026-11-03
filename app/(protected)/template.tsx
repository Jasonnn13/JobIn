// Re-mounts on every navigation, so each page's content eases in while the header stays put.
export default function ProtectedTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-enter">{children}</div>
}
