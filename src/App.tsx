import { Outlet } from '@tanstack/react-router';
import BlockUI from './components/BlockUI';

export default function App() {
  return (
    <>
      <BlockUI />
      <Outlet />
    </>
  );
}
