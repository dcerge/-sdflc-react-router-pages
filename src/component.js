import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { processRoutes } from './utils';

const SdFlcReactRouterPages = (props) => {
  const { siteMap, layout } = props;

  /**
   * Renders a page component with wrapping it by a layout if it exists.
   * @param {component} component is a page to render
   * @param {object} pageProps is set of props to pass to page component
   */
  const renderMergedProps = (component, pageProps) => {
    const { page } = pageProps;
    const finalProps = Object.assign({}, pageProps);
    const renderedComponent = React.createElement(component, finalProps);
    let wrapper = null;

    if (page.layout) {
      // Page has specified layout component to use when rendering
      wrapper = React.createElement(page.layout, {
        children: renderedComponent,
        page
      });
    } else if (layout) {
      // The SdFclPages component has specified layout component to use when rendering pages
      wrapper = React.createElement(layout, {
        children: renderedComponent,
        page
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
      if (!page.url && !page.component !== undefined) {
        return null;
      }

      const path = page.urlmask || page.url;
      const exact = page.urlmask === undefined || page.urlmask.length === 0 ? true : false;

      return React.createElement(
        Route,
        {
          key: page.url,
          exact,
          path,
          render: (innerProps) =>
            renderMergedProps(page.component, {
              page,
              ...innerProps,
            })
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
  layout: PropTypes.oneOfType([PropTypes.node, PropTypes.element, PropTypes.func])
};

export default SdFlcReactRouterPages;
