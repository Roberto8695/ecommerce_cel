export const metadata = {
  title: 'Login - ECommerce Cel Admin',
  description: 'Accede al panel de administración de ECommerce Cel',
};

export default function LoginLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900">
      {children}
    </div>
  );
}