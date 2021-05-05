import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { processRoutes } from './utils';

const selectComponentToUse = (componentsMap, component) => {
  return typeof component === 'string' ? componentsMap[component] : component;
};

const SdFlcReactRouterPages = (props) => {
  const {
    componentsMap,
    failoverComponent,
    layout,
    roles,
    rolesDontMatchComponent,
    rolesDontMatchLayout,
    siteMap,
  } = props;
  const rdmComponentToUse = selectComponentToUse(componentsMap, rolesDontMatchComponent);
  const rdmLayoutToUse = selectComponentToUse(componentsMap, rolesDontMatchLayout);

  const selectLayout = (args) => {
    const { page, rolesDontMatch } = args;
    let layout2use = React.Fragment;

    if (rolesDontMatch && rdmLayoutToUse) {
      // Page has specified layout component to use when rendering
      layout2use = rdmLayoutToUse;
    } else if (page.layout) {
      // Page has specified layout component to use when rendering
      layout2use = page.layout;
    } else if (layout) {
      // The SdFclPages component has specified layout component to use when rendering pages
      layout2use = layout;
    }

    return selectComponentToUse(componentsMap, layout2use);
  };

  /**
   * Takes site map array (represents all the pages in the hierarchical way) and
   * renders <Route> components for each page.
   */
  const renderRoutes = () => {
    return processRoutes(siteMap).map((page) => {
      const { roles: pageRoles, url, urlmask, component } = page;

      if (!url || !component) {
        return null;
      }

      let ComponentToUse = selectComponentToUse(componentsMap, component);
      const pageHasRoles = Array.isArray(pageRoles) && pageRoles.length > 0;
      let rolesToMatch = roles || [];

      if (pageHasRoles && typeof roles === 'function') {
        rolesToMatch = roles();
      }

      let rolesDontMatch = false;
      if (pageHasRoles) {
        const intersectedRoles = rolesToMatch.filter((value) => pageRoles.includes(value));
        rolesDontMatch = intersectedRoles.length === 0;

        if (rolesDontMatch) {
          if (rdmComponentToUse) {
            ComponentToUse = rdmComponentToUse;
          } else {
            return null;
          }
        }
      }

      const path = urlmask || url;
      const exact = urlmask === undefined || urlmask.length === 0 ? true : false;

      let Layout = selectLayout({ page, rolesDontMatch });
      let failoverFor = undefined;

      if (!Layout) {
        console.error(
          'Page layout not found in componentsMap or is not a component, page details:',
          componentsMap,
          layout,
          page
        );
        Layout = failoverComponent;
        failoverFor = 'layout';
      }

      if (!ComponentToUse) {
        ComponentToUse = failoverComponent;
        failoverFor = 'page';
      }

      const props2Use = { page, siteMap, rolesDontMatch, failoverFor };

      return (
        <Route key={url} exact={exact} path={path}>
          <Layout {...props2Use}>
            <ComponentToUse {...props2Use} />
          </Layout>
        </Route>
      );
    });
  };

  return (
    <BrowserRouter>
      <Switch>{renderRoutes()}</Switch>
    </BrowserRouter>
  );
};

const SiteMapItem = {
  parent: PropTypes.object,
  name: PropTypes.string,
  subtitle: PropTypes.string,
  url: PropTypes.string.isRequired,
  urlMask: PropTypes.string,
  component: PropTypes.oneOfType([PropTypes.node, PropTypes.element, PropTypes.func]).isRequired,
  layout: PropTypes.oneOfType([PropTypes.node, PropTypes.element, PropTypes.func]),
  visible: PropTypes.bool,
  options: PropTypes.object,
};

SdFlcReactRouterPages.displayName = 'SdFlcReactRouterPages';

SdFlcReactRouterPages.propTypes = {
  siteMap: PropTypes.arrayOf(
    PropTypes.shape({
      ...SiteMapItem,
      items: PropTypes.arrayOf(PropTypes.shape(SiteMapItem)),
    })
  ).isRequired,
  layout: PropTypes.oneOfType([PropTypes.node, PropTypes.element, PropTypes.func]),
  componentsMap: PropTypes.object,
  failoverComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.element, PropTypes.func]),
  roles: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.func]),
  rolesDontMatchComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.element, PropTypes.func]),
  rolesDontMatchLayout: PropTypes.oneOfType([PropTypes.node, PropTypes.element, PropTypes.func]),
};

export { SdFlcReactRouterPages };
