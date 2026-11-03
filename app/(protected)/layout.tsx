import VoiceAssistantFloating from '@/components/VoiceAssistantFloating'

// Sign-in and the worker role are enforced on the server in proxy.ts before this renders.
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <VoiceAssistantFloating />
    </>
  )
}
