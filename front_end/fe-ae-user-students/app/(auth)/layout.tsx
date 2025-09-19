export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh grid grid-rows-[auto_1fr]">
    <header className="h-14 border-b bg-white/80 backdrop-blur container-px flex items-center"><div className="font-bold">AI Enhance</div></header>
    <main className="container-px py-6">{children}</main>
  </div>;
}
