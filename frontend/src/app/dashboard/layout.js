import SidebarComponent from '@/components/Sidebar/SidebarComponent';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <SidebarComponent />
        
        {/* Contenido principal */}
        <main className="flex-1 p-6 lg:ml-2">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}