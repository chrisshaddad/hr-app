'use client';

type AppLayoutProps = {
  children: React.ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="h-full w-[300px] flex-shrink-0 bg-Others-White border-r border-GreyScale-300">
        {/* Sidebar content will go here */}
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="h-[80px] flex-shrink-0 bg-Others-White border-b border-GreyScale-300">
          {/* Header content will go here */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export { AppLayout };
