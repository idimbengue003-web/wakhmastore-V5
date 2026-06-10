// Force dynamic rendering for auth callback to avoid next-auth SSR issues
export const dynamic = 'force-dynamic';

export default function AuthCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
