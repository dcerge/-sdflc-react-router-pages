import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { processRoutes } from './utils';

// ============================================
// Helper Functions
// ============================================

const selectComponentToUse = (componentsMap, component) => {
  if (!component) return null;
  return typeof component === 'string' ? componentsMap[component] : component;
};

const getRolesToMatch = (roles) => {
  if (typeof roles === 'function') {
    return roles();
  }
  if (Array.isArray(roles)) {
    return roles;
  }
  return [];
};

// ============================================
// Default Components
// ============================================

const DefaultLayout = ({ children }) => <>{children}</>;
const DefaultWrapper = ({ children }) => <>{children}</>;

// ============================================
// Route Content Component
// ============================================

function RouteContent({ 
  page, 
  componentsMap,
  layout,
  rolesDontMatchComponent,
  rolesDontMatchLayout,
  failoverComponent,
  roles,
  siteMap 
}) {
  const location = useLocation();
  
  // Check if page has role requirements
  const pageHasRoles = Array.isArray(page.roles) && page.roles.length > 0;
  
  // Get roles to match - always resolve function if provided
  const rolesToMatch = getRolesToMatch(roles);

  // Check if user roles match page requirements
  let rolesDontMatch = false;
  if (pageHasRoles) {
    const intersectedRoles = rolesToMatch.filter((value) => page.roles.includes(value));
    rolesDontMatch = intersectedRoles.length === 0;
  }
  
  // Determine which component to render
  let ComponentToUse = selectComponentToUse(componentsMap, page.component);
  let usingFailover = false;
  
  if (rolesDontMatch && rolesDontMatchComponent) {
    ComponentToUse = selectComponentToUse(componentsMap, rolesDontMatchComponent);
  }
  
  if (!ComponentToUse) {
    ComponentToUse = failoverComponent || (() => null);
    usingFailover = true;
  }

  // Determine which layout to use
  let Layout = DefaultLayout;
  if (rolesDontMatch && rolesDontMatchLayout) {
    Layout = selectComponentToUse(componentsMap, rolesDontMatchLayout) || DefaultLayout;
  } else if (page.layout) {
    Layout = selectComponentToUse(componentsMap, page.layout) || DefaultLayout;
  } else if (layout) {
    Layout = selectComponentToUse(componentsMap, layout) || DefaultLayout;
  }

  // Build props for both layout and component
  const props = {
    page,
    siteMap,
    rolesDontMatch,
    location,
    usingFailover,
  };

  return (
    <Layout {...props}>
      <ComponentToUse {...props} />
    </Layout>
  );
}

// ============================================
// Not Found Route Component
// ============================================

function NotFoundRoute({ component: Component }) {
  const location = useLocation();
  return <Component location={location} />;
}

// ============================================
// Main Router Component
// ============================================

function SdFlcReactRouterPages({
  siteMap,
  layout,
  componentsMap = {},
  failoverComponent,
  roles,
  rolesDontMatchComponent,
  rolesDontMatchLayout,
  appWrapper: AppWrapper = DefaultWrapper,
  routerComponents: {
    BrowserRouter: RouterComponent = BrowserRouter
  } = {}
}) {
  // Memoize routes to prevent recreation on every render
  const routes = useMemo(() => {
    const processedRoutes = processRoutes(siteMap)
      .filter(page => {
        // Filter out pages without URL or component
        return page.url && page.component;
      })
      .map(page => {
        // Support both urlMask (camelCase) and urlmask (lowercase)
        const path = page.urlMask || page.urlmask || page.url;
        
        return (
          <Route
            key={page.url}
            path={path}
            element={
              <RouteContent
                page={page}
                componentsMap={componentsMap}
                layout={layout}
                rolesDontMatchComponent={rolesDontMatchComponent}
                rolesDontMatchLayout={rolesDontMatchLayout}
                failoverComponent={failoverComponent}
                roles={roles}
                siteMap={siteMap}
              />
            }
          />
        );
      });

    // Add fallback route if failoverComponent is provided
    if (failoverComponent) {
      processedRoutes.push(
        <Route
          key="not-found"
          path="*"
          element={<NotFoundRoute component={failoverComponent} />}
        />
      );
    }

    return processedRoutes;
  }, [
    siteMap,
    componentsMap,
    layout,
    rolesDontMatchComponent,
    rolesDontMatchLayout,
    failoverComponent,
    roles
  ]);

  return (
    <RouterComponent>
      <AppWrapper>
        <Routes>
          {routes}
        </Routes>
      </AppWrapper>
    </RouterComponent>
  );
}

export { SdFlcReactRouterPages };