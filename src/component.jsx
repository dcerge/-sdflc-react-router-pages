import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { processRoutes } from './utils';

const selectComponentToUse = (componentsMap, component) => {
  return typeof component === 'string' ? componentsMap[component] : component;
};

const DefaultLayout = ({ children }) => <>{children}</>;

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
  
  let ComponentToUse = selectComponentToUse(componentsMap, page.component);
  if (rolesDontMatch && rolesDontMatchComponent) {
    ComponentToUse = selectComponentToUse(componentsMap, rolesDontMatchComponent);
  }
  if (!ComponentToUse) {
    ComponentToUse = failoverComponent || (() => null);
  }

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
}

function NotFoundRoute({ component: Component }) {
  const location = useLocation();
  return <Component location={location} />;
}

function SdFlcReactRouterPages({
  siteMap,
  layout,
  componentsMap = {},
  failoverComponent,
  roles,
  rolesDontMatchComponent,
  rolesDontMatchLayout,
  routerComponents: {
    BrowserRouter: RouterComponent = BrowserRouter
  } = {}
}) {
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

  if (failoverComponent) {
    routes.push(
      <Route
        key="not-found"
        path="*"
        element={<NotFoundRoute component={failoverComponent} />}
      />
    );
  }

  return (
    <RouterComponent>
      <Routes>
        {routes}
      </Routes>
    </RouterComponent>
  );
}

export { SdFlcReactRouterPages };