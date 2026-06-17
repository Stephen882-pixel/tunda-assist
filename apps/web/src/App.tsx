import { ChatWidget } from './components/ChatWidget';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white">
      {/* Background landing page */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl chat-header-gradient flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tunda Assist</h1>
          <p className="text-gray-500 mb-8">
            Your AI-powered commission assistant. Click the chat button in the bottom-right corner to get started.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-emerald-600">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            AI Assistant Active
          </div>
        </div>
      </div>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
}

export default App;
