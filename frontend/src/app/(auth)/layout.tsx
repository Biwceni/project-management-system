export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafbfc] p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded bg-[#0052cc] text-base font-bold text-white">
            PM
          </div>
          <h1 className="text-xl font-bold text-[#172b4d]">Project Manager</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
