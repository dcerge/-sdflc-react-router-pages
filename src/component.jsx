import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { processRoutes, findPageByUrl } from './utils';

const selectComponentToUse = (componentsMap, component) => {
  return typeof component === 'string' ? componentsMap[component] : component;
};

// Basic wrapper component to avoid passing props to Fragment
const DefaultLayout = ({ children }) => <>{children}</>;

const RouteContent = ({ 
  page, 
  componentsMap,
  layout,
  rolesDontMatchComponent,
  rolesDontMatchLayout,
  failoverComponent,
  roles,
  siteMap 
}) => {
  const location = useLocation();
  
  // Process roles
  const pageHasRoles = Array.isArray(page.roles) && page.roles.length > 0;
  let rolesToMatch = roles || [];
  
  if (pageHasRoles && typeof roles === 'function') {
    rolesToMatch = roles();
  }

  let rolesDontMatch = false;
  if (pageHasRoles) {
    const intersectedRoles = rolesToMatch.filter((value) => page.roles.includes(value));
    rolesDontMatch = intersectedRoles.length === 0;
  }
  
  // Select the component to render
  let ComponentToUse = selectComponentToUse(componentsMap, page.component);
  if (rolesDontMatch && rolesDontMatchComponent) {
    ComponentToUse = selectComponentToUse(componentsMap, rolesDontMatchComponent);
  }
  if (!ComponentToUse) {
    ComponentToUse = failoverComponent || (() => null);
  }

  // Select the layout
  let Layout = DefaultLayout;
  if (rolesDontMatch && rolesDontMatchLayout) {
    Layout = selectComponentToUse(componentsMap, rolesDontMatchLayout) || DefaultLayout;
  } else if (page.layout) {
    Layout = selectComponentToUse(componentsMap, page.layout) || DefaultLayout;
  } else if (layout) {
    Layout = selectComponentToUse(componentsMap, layout) || DefaultLayout;
  }

  const props = {
    page,
    siteMap,
    rolesDontMatch,
    location,
    failoverFor: !ComponentToUse ? 'page' : (!Layout ? 'layout' : undefined)
  };

  return (
    <Layout>
      <ComponentToUse {...props} />
    </Layout>
  );
};

const NotFoundRoute = ({ component: FailoverComponent }) => {
  const location = useLocation();
  return <FailoverComponent location={location} />;
};

const SdFlcReactRouterPages = ({
  siteMap,
  layout,
  componentsMap = {},
  failoverComponent,
  roles,
  rolesDontMatchComponent,
  rolesDontMatchLayout,
  routerComponents: {
    BrowserRouter: CustomBrowserRouter = BrowserRouter
  } = {}
}) => {
  const renderRoutes = () => {
    const routes = processRoutes(siteMap).map(page => {
      const { url, urlmask } = page;
      
      if (!url || !page.component) {
        return null;
      }

      const path = urlmask || url;
      
      return (
        <Route
          key={url}
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

    // Add catch-all route for non-existent paths
    if (failoverComponent) {
      routes.push(
        <Route
          key="not-found"
          path="*"
          element={<NotFoundRoute component={failoverComponent} />}
        />
      );
    }

    return routes;
  };

  return (
    <CustomBrowserRouter>
      <Routes>
        {renderRoutes()}
      </Routes>
    </CustomBrowserRouter>
  );
};

export { SdFlcReactRouterPages, findPageByUrl };