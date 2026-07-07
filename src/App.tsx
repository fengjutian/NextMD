import { AppLayout } from './components/layout/AppLayout';
import { useTheme } from './hooks/useTheme';

function App() {
  useTheme(); // Apply theme reactively
  return <AppLayout />;
}

export default App;
