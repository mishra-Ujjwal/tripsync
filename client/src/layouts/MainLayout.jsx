import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const MainLayout = () => (
  <div className="relative min-h-screen overflow-hidden bg-surface text-ink voyager-surface">
    <Navbar />
    <main className="relative z-10">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default MainLayout;
