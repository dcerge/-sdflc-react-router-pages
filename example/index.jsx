import { createRoot } from 'react-dom/client';
import App from './App';

// Find the root element and render the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root element not found');
}
