import { useState } from 'react';
import Navigation from './components/Navigation';
import UrlShortener from './components/UrlShortener';
import UrlAnalytics from './components/UrlAnalytics';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('shorten');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'shorten' && <UrlShortener />}
        {activeTab === 'analytics' && <UrlAnalytics />}
      </main>
      
      <footer className="mt-16 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">URL Shortener Service</p>
            <p className="text-sm">
              Backend API: <span className="font-mono text-blue-600">http://localhost:8080</span> | 
              Logging Service: <span className="font-mono text-green-600">http://localhost:3000</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
