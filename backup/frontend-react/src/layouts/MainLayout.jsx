import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
