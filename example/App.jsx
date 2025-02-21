import { Link, useLocation } from 'react-router-dom';
import { SdFlcReactRouterPages } from '../src';

// Page Components
const HomePage = () => {
  return <div>Home</div>;
};

const AboutPage = () => {
  return <div>About</div>;
};

const DashboardPage = () => {
  return <div>Dashboard</div>;
};

const DashboardEditPage = () => {
  return <div>Dashboard Edit</div>;
};

// Layout Component
const MainLayout = ({ children, page }) => {
  const location = useLocation();

  // Create navigation based on the sitemap structure
  const renderNavigation = (items, level = 0) => {
    return items.map((item) => {
      if (item.visible === false) return null;

      const isActive = location.pathname === item.url;
      const style = {
        marginLeft: `${level * 20}px`,
        color: isActive ? 'blue' : 'black',
        textDecoration: isActive ? 'underline' : 'none',
      };

      return (
        <div key={item.url} style={{ padding: '5px 0' }}>
          <Link to={item.url} style={style}>
            {item.name}
            {item.subtitle && <small style={{ marginLeft: '8px', color: 'gray' }}>{item.subtitle}</small>}
          </Link>
          {item.items && renderNavigation(item.items, level + 1)}
        </div>
      );
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav
        style={{
          width: '250px',
          padding: '20px',
          borderRight: '1px solid #eee',
        }}
      >
        <h2>Navigation</h2>
        {renderNavigation([page.parent || page])}
      </nav>

      <main style={{ flex: 1, padding: '20px' }}>
        <header style={{ marginBottom: '20px' }}>
          <h1>{page.name}</h1>
          {page.subtitle && <p style={{ color: 'gray' }}>{page.subtitle}</p>}
        </header>

        {children}

        {page.options && (
          <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
            <h3>Page Options:</h3>
            <pre>{JSON.stringify(page.options, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  );
};

// Site Map Configuration
const siteMap = [
  {
    name: 'Home',
    subtitle: 'Welcome to the app',
    url: '/example/index.html',
    component: HomePage,
    options: {
      some: 'Test',
    },
    items: [
      {
        name: 'About',
        subtitle: '',
        url: '/about',
        component: AboutPage,
      },
      {
        name: 'Dashboard',
        subtitle: 'View all data here',
        url: '/dashboard',
        component: DashboardPage,
        items: [
          {
            name: 'Edit',
            url: '/dashboard/edit',
            component: DashboardEditPage,
            visible: false,
          },
        ],
      },
    ],
  },
];

// Error Components
const NotFound = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>404 - Page Not Found</h2>
    <p>The page you're looking for doesn't exist.</p>
    <Link to='/'>Go Home</Link>
  </div>
);

const App = () => {
  return <SdFlcReactRouterPages siteMap={siteMap} layout={MainLayout} failoverComponent={NotFound} />;
};

export default App;
