import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SdFlcReactRouterPages } from '../src/component';

// Test Components
const HomePage = () => <div>Home Page</div>;
const AboutPage = () => <div>About Page</div>;
const AdminPage = () => <div>Admin Page</div>;
const NotAuthorizedPage = () => <div>Not Authorized</div>;

// Test Layout
const MainLayout = ({ children }) => (
  <div data-testid="main-layout">
    <nav>Navigation</nav>
    <main>{children}</main>
  </div>
);

// Custom render function with MemoryRouter
const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};

describe('SdFlcReactRouterPages Component', () => {
  const basicSiteMap = [
    {
      name: 'Home',
      url: '/',
      component: HomePage
    },
    {
      name: 'About',
      url: '/about',
      component: AboutPage
    }
  ];

  const protectedSiteMap = [
    ...basicSiteMap,
    {
      name: 'Admin',
      url: '/admin',
      component: AdminPage,
      roles: ['admin']
    }
  ];

  it('renders basic routes correctly', () => {
    const { container } = renderWithRouter(
      <SdFlcReactRouterPages
        siteMap={basicSiteMap}
        routerComponents={{ BrowserRouter: ({ children }) => children }}
      />
    );
    expect(screen.getByText('Home Page')).toBeDefined();
  });

  it('renders about page when navigated to /about', () => {
    const { container } = renderWithRouter(
      <SdFlcReactRouterPages
        siteMap={basicSiteMap}
        routerComponents={{ BrowserRouter: ({ children }) => children }}
      />,
      { route: '/about' }
    );
    expect(screen.getByText('About Page')).toBeDefined();
  });

  it('applies layout correctly', () => {
    const { container } = renderWithRouter(
      <SdFlcReactRouterPages
        siteMap={basicSiteMap}
        layout={MainLayout}
        routerComponents={{ BrowserRouter: ({ children }) => children }}
      />
    );
    expect(screen.getByTestId('main-layout')).toBeDefined();
    expect(screen.getByText('Navigation')).toBeDefined();
    expect(screen.getByText('Home Page')).toBeDefined();
  });

  it('handles role-based access correctly', () => {
    const { container } = renderWithRouter(
      <SdFlcReactRouterPages
        siteMap={protectedSiteMap}
        roles={['user']}
        rolesDontMatchComponent={NotAuthorizedPage}
        routerComponents={{ BrowserRouter: ({ children }) => children }}
      />,
      { route: '/admin' }
    );
    expect(screen.getByText('Not Authorized')).toBeDefined();
  });

  it('allows access to protected routes with correct role', () => {
    const { container } = renderWithRouter(
      <SdFlcReactRouterPages
        siteMap={protectedSiteMap}
        roles={['admin']}
        rolesDontMatchComponent={NotAuthorizedPage}
        routerComponents={{ BrowserRouter: ({ children }) => children }}
      />,
      { route: '/admin' }
    );
    expect(screen.getByText('Admin Page')).toBeDefined();
  });

  it('uses failover component for non-existent routes', async () => {
    const NotFound = () => <div>404 Not Found</div>;
    
    const { container } = renderWithRouter(
      <SdFlcReactRouterPages
        siteMap={basicSiteMap}
        failoverComponent={NotFound}
        routerComponents={{ BrowserRouter: ({ children }) => children }}
      />,
      { route: '/non-existent' }
    );
    
    expect(screen.getByText('404 Not Found')).toBeDefined();
  });
});