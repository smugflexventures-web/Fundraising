import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center py-12 px-4">
    <div className="text-center">
      <h1 className="text-8xl font-bold text-gradient mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary inline-flex items-center gap-2">
        <Home className="w-4 h-4" /> Go Home
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
