import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Home from './components/Home';
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './components/ForgotPassword';
import Account from './components/Account';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<Home />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/account" element={<Account />} />
        </Routes>
    </Router>
  );
}

export default App;
