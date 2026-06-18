import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './store/auth/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import ChatbotWidget from './components/common/ChatbotWidget.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App relative">
          <AppRoutes />
          <ChatbotWidget />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
