import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { processRoutes } from './utils';

const selectComponentToUse = (componentsMap, component) => {
  return typeof component === 'string'
    ? componentsMap[component]
    : component;
};

const SdFlcReactRouterPages = (props) => {
  const { componentsMap, failoverComponent, layout, roles, rolesDontMatchComponent, rolesDontMatchLayout, siteMap } = props;
  const rdmComponentToUse = selectComponentToUse(componentsMap, rolesDontMatchComponent);
  const rdmLayoutToUse = selectComponentToUse(componentsMap, rolesDontMatchLayout);

  const renderLayout = (layout, props) => {
    let layoutToUse = selectComponentToUse(componentsMap, layout);
    let propstoUse = props || {};

    if (!layoutToUse) {
      console.error('Page layout not found in componentsMap or is not a component, page details:', propstoUse.page);
      layoutToUse = failoverComponent;
      propstoUse = {
        ...props,
        failoverFor: 'layout'
      };
    }

    return layoutToUse
      ? React.createElement(layoutToUse, propstoUse)
      : null;
  }

  /**
   * Renders a page component with wrapping it by a layout if it exists.
   * @param {component} component is a page to render
   * @param {object} pageProps is set of props to pass to page component
   */
  const renderMergedProps = (component, pageProps) => {
    const { page, siteMap, rolesDontMatch } = pageProps;
    let finalProps = Object.assign({}, pageProps);

    if (!component) {
      console.error('Page component not found in componentsMap either it is not a component, page details:', pageProps);
      component = failoverComponent;
      finalProps = {
        ...finalProps,
        failoverFor: 'page'
      }
    }

    const renderedComponent = React.createElement(component, finalProps);
    let wrapper = null;

    if (rolesDontMatch && rdmLayoutToUse) {
      // Page has specified layout component to use when rendering
      wrapper = renderLayout(rdmLayoutToUse, {
        children: renderedComponent,
        page,
        siteMap,
        rolesDontMatch
      });
    } else if (page.layout) {
      // Page has specified layout component to use when rendering
      wrapper = renderLayout(page.layout, {
        children: renderedComponent,
        page,
        siteMap,
        rolesDontMatch
      });
    } else if (layout) {
      // The SdFclPages component has specified layout component to use when rendering pages
      wrapper = renderLayout(layout, {
        children: renderedComponent,
        page,
        siteMap,
        rolesDontMatch
      });
    } else {
      // There is no layout component to wrapp the page when rendering
      wrapper = renderedComponent;
    }
    
    return wrapper;
  }

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

      let componentToUse = selectComponentToUse(componentsMap, component);
      const pageHasRoles = Array.isArray(pageRoles) && pageRoles.length > 0;
      let rolesToMatch = roles || [];

      if (pageHasRoles && typeof roles === 'function') {
        rolesToMatch = roles();
      }

      let rolesDontMatch = false;
      if (pageHasRoles) {
        const intersectedRoles = rolesToMatch.filter(value => pageRoles.includes(value));
        rolesDontMatch = intersectedRoles.length === 0;

        if (rolesDontMatch) {
          if (rdmComponentToUse) {
            componentToUse = rdmComponentToUse;
          } else {
            return null;
          }
        }
      }
      
      const path = urlmask || url;
      const exact = urlmask === undefined || urlmask.length === 0 ? true : false;

      return React.createElement(
        Route,
        {
          key: url,
          exact,
          path,
          render: (innerProps) => {
            return renderMergedProps(componentToUse, {
              page,
              siteMap,
              rolesDontMatch,
              ...innerProps,
            });
          }
        }
      );
    });
  }

  const el = React.createElement(BrowserRouter, {
    children: React.createElement(Switch, {
      children: renderRoutes()
    })
  });

  return el;
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

SdFlcReactRouterPages.displayName = "SdFlcReactRouterPages";

SdFlcReactRouterPages.propTypes = {
  siteMap: PropTypes.arrayOf(PropTypes.shape({
    ...SiteMapItem,
    items: PropTypes.arrayOf(PropTypes.shape(SiteMapItem))
  })).isRequired,
  layout: PropTypes.oneOfType([PropTypes.node, PropTypes.element, PropTypes.func]),
  componentsMap: PropTypes.object,
  failoverComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.element, PropTypes.func]),
  roles: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.func]),
  rolesDontMatchComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.element, PropTypes.func]),
  rolesDontMatchLayout: PropTypes.oneOfType([PropTypes.node, PropTypes.element, PropTypes.func]),
};

export default SdFlcReactRouterPages;
