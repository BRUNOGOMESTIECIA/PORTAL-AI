const fs = require('fs');

const opShellPath = 'C:/Users/Bruno Gomes/Documents/PORTAL-AI/apps/web/src/portals/operational/OperationalShell.tsx';
let opContent = fs.readFileSync(opShellPath, 'utf8');

// 1. Remove justify-between and min-h-screen from <main>, use simple flex column with overflow-y-auto
opContent = opContent.replace(
  /<main className=\{cn\('flex-1 relative flex flex-col min-h-screen justify-between', location\.pathname\.includes\('\/chat'\) \? 'overflow-hidden' : 'overflow-y-auto p-4 sm:p-6 pb-8'\)\}>/g,
  "<main className={cn('flex-1 relative flex flex-col', location.pathname.includes('/chat') ? 'overflow-hidden' : 'overflow-y-auto p-4 sm:p-6')}>"
);

opContent = opContent.replace(
  /<main className=\{cn\('flex-1 relative flex flex-col min-h-full justify-between', location\.pathname\.includes\('\/chat'\) \? 'overflow-hidden' : 'overflow-y-auto p-4 sm:p-6'\)\}>/g,
  "<main className={cn('flex-1 relative flex flex-col', location.pathname.includes('/chat') ? 'overflow-hidden' : 'overflow-y-auto p-4 sm:p-6')}>"
);

// 2. Ensure PageTransitionWrapper / Outlet is in a flex-1 container and Footer is placed after it in normal flow
opContent = opContent.replace(
  `<main className={cn('flex-1 relative flex flex-col', location.pathname.includes('/chat') ? 'overflow-hidden' : 'overflow-y-auto p-4 sm:p-6')}>
          <ErrorBoundary>
            <PageTransitionWrapper keyName={location.pathname}>
              <Outlet />
            </PageTransitionWrapper>
          </ErrorBoundary>
          {!location.pathname.includes('/chat') && <CorporateFooterWidget />}
        </main>`,
  `<main className={cn('flex-1 relative flex flex-col justify-between min-h-0', location.pathname.includes('/chat') ? 'overflow-hidden' : 'overflow-y-auto p-4 sm:p-6')}>
          <div className="flex-1 flex flex-col w-full pb-8">
            <ErrorBoundary>
              <PageTransitionWrapper keyName={location.pathname}>
                <Outlet />
              </PageTransitionWrapper>
            </ErrorBoundary>
          </div>
          {!location.pathname.includes('/chat') && <CorporateFooterWidget />}
        </main>`
);

fs.writeFileSync(opShellPath, opContent, 'utf8');
console.log('Fixed OperationalShell.tsx layout flow!');
