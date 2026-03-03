/**
 * Auth layout override — counteracts the parent appview layout's
 * safe-area top padding, horizontal padding, and bottom padding,
 * giving auth screens a clean full-screen appearance.
 */
export default function AppViewAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="-mt-[max(env(safe-area-inset-top),1rem)] -mx-4 -mb-24">
      {children}
    </div>
  );
}
