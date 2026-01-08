import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { ToastContainer } from '../ui/Toast';
import ChatAssistant from '../chat/ChatAssistant';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
      <ChatAssistant />
    </div>
  );
};

export default MainLayout;
