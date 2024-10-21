import NextAuthProvider from '~/utils/NextAuthProvider';
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <NextAuthProvider>
      {children}
      </NextAuthProvider>
    </main>
  );
}
