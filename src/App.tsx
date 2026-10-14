import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { CookieBanner } from './components/CookieBanner';
import { Changelog } from './pages/Changelog';
import { Home } from './pages/home/Home';
import { Loading } from './pages/Loading';
import { PremiumCode } from './pages/premium/PremiumCode';
import { PremiumDone } from './pages/premium/PremiumDone';
import { PremiumPlan } from './pages/premium/PremiumPlan';
import { PremiumWaiting } from './pages/premium/PremiumWaiting';
import { Preview } from './pages/preview/Preview';
import { RestoreAccount } from './pages/restore/RestoreAccount';
import { RestoreCode } from './pages/restore/RestoreCode';
import { RestoreDone } from './pages/restore/RestoreDone';
import { RestoreForum } from './pages/restore/RestoreForum';
import { ScreensIndex } from './pages/ScreensIndex';
import { ProtoOverlay } from './proto/ProtoOverlay';

const TITLES: Record<string, string> = {
  '/': 'vpn.free — Open any website without installing anything',
  '/connecting': 'Connecting… — vpn.free',
  '/browse': 'The Daily Lens — via vpn.free',
  '/support': 'Support vpn.free',
  '/account': 'Your account — vpn.free',
  '/changelog': "What's new — vpn.free",
  '/screens': 'All screens — vpn.free prototype',
};

function RouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const base = '/' + (pathname.split('/')[1] ?? '');
    document.title = TITLES[base] ?? TITLES['/'];
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <>
      <RouteEffects />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/connecting" element={<Loading />} />
        <Route path="/browse" element={<Preview />} />
        <Route path="/browse/share" element={<Preview />} />
        <Route path="/browse/report" element={<Preview />} />
        <Route path="/support" element={<PremiumPlan />} />
        <Route path="/support/code" element={<PremiumCode />} />
        <Route path="/support/waiting" element={<PremiumWaiting />} />
        <Route path="/support/done" element={<PremiumDone />} />
        <Route path="/account" element={<RestoreAccount />} />
        <Route path="/account/code" element={<RestoreCode />} />
        <Route path="/account/forum" element={<RestoreForum />} />
        <Route path="/account/done" element={<RestoreDone />} />
        <Route path="/changelog" element={<Changelog />} />
        <Route path="/screens" element={<ScreensIndex />} />
        <Route path="*" element={<ScreensIndex notFound />} />
      </Routes>
      <CookieBanner />
      <ProtoOverlay />
    </>
  );
}
