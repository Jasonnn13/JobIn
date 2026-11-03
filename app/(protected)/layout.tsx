import Header from '@/components/Header'
import VoiceAssistantFloating from '@/components/VoiceAssistantFloating'

// Sign-in and the worker role are enforced on the server in proxy.ts before this renders.
// The header lives here (not in each page) so it stays still while pages change.
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {/* Room for the phone tab bar. */}
      <div className="pb-20 md:pb-0">{children}</div>
      <VoiceAssistantFloating />
    </>
  )
}
