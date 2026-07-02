import { Outlet } from '@tanstack/react-router';
import BlockUI from './shared/components/BlockUI';
import GlobalNotifier from './shared/components/GlobalNotifier';

export default function App() {
  return (
    <>
      <BlockUI />
      <GlobalNotifier />
      <Outlet />
    </>
  );
}
