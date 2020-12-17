# @sdflc / React Router Pages

This is simple helper component for react application that uses an array with a list of pages to render component `<Route>` (from `react-router-dom`) for each page from that array. In some cases it may simplify web application page management. 

# Installation

```
npm install @sdflc/react-router-pages
```

# Usage

To start using the component you need to follow the steps:
- create pages components - components that represent each page. For an example, see below file `src/pages/index.js`
- create a layout component(s) - optional components that wrap each page. For an example, see below file `src/layouts/layoutMain.js`
- create a site map array - the array should contain information about all the pages. For an example, see below file `src/siteMap.js`
- optionaly create `componentsMap` object to pass so you could make `siteMap` as json file with names of components instead of references to components classes. For an example, see below file `src/componentsMap.js`
- use `<SdFlcReactRouterPages/>` instead of `react-router-dom` `<Route>` components in the `src/App.js` file as this component will render them for you.

## Properties

### siteMap

The _required_ `siteMap` property is an array containing items of the following structure:

```js
{
  name: 'Projects', // Page name, you can use it in your component when displaying page name
  subtitle: 'Manage your projects on this page', // Page subtitle, you can use it in your component when displaying page name
  url: '/projects', // Page URL for exact page match passed to <Router>. If this parameter is provided next one is ignored
  urlMask: '/projects/edit/:projectId', // Page URL mask for page with parameters for not exact match passed to <Router>
  component: ProjectPage, // A component that renders the page content
  layout: DefaultLaout, // Optional component that is used as layout, ie wraps the page.
  visible: true, // Optional boolean, you can use it when building navigation menu from this array
  options: null, // Optional object you can use to pass extra parameters to the page.
  items: [], // An array of pages that go under the page. For example, 
             // if this is the '/projects' page, you can add '/projects/add' 
             // or '/projects/edit/:projectId' 
}
```

Each page component gets the following props:

- **page** - the page details information. An item from siteMap array
- **siteMap** - the site map array
- **rolesDontMatch** - boolean which is true in this case
- other properties provided by `react-router-dom`

### layout

The _optional_ `layout` prop is used to wrap all the pages components with this one. It can be used to define default pages layout containing navigation menu, footer, etc.
If a page has its own `layout` prop then it will be used instead of global one.

This component gets the following props:

- **page** - the page details information. An item from siteMap array
- **siteMap** - the site map array
- **rolesDontMatch** - boolean which is true in this case
- other properties provided by `react-router-dom`

### componentsMap

The _optional_ `componentsMap` prop is used to pages and layouts components look up by names. It allows you to use string names for components and layouts in the siteMap array instead of components themselves. Thus you can make siteMap as json file that can be either local or remote.

### failoverComponent

The _optional_ `failoverComponent` prop makes sense to use together with `componentsMap` in order to render `failoverComponent` in case when page/layout component was not found in the `componentsMap` prop. In this case, the `failoverComponent` is used for rendering where `failoverFor` and `page` props are passed. The `failoverFor` will have either `layout` or `page` string value so your failover component could render something meaningful for a user.

This component gets the following props:

- **page** - the page details information. An item from siteMap array
- **siteMap** - the site map array
- **rolesDontMatch** - boolean which is true in this case
- other properties provided by `react-router-dom`

### roles

The _optional_ `roles` prop is a string array or a function that can be used to render only those pages that have at least one role matched to array in the props. For explanation please see the example below

### rolesDontMatchComponent

The _optional_ `rolesDontMatchComponent` prop defines a component to use for pages that have roles which can't be found in this component's `roles` prop. This component will be wrapped default page's layout or by `rolesDontMatchLayout` if it is present. Using this component you can notify user that he tries to get access to restricted page and possible provide him ways to get the access.

This component gets the following props:

- **page** - the page details information. An item from siteMap array
- **siteMap** - the site map array
- **rolesDontMatch** - boolean which is true in this case
- other properties provided by `react-router-dom`

### rolesDontMatchLayout

The _optional_ `rolesDontMatchLayout` prop defines a component that will be used as a layout for the `rolesDontMatchComponent`.

This component gets the following props:

- **page** - the page details information. An item from siteMap array
- **siteMap** - the site map array
- **rolesDontMatch** - boolean which is true in this case
- other properties provided by `react-router-dom`

# Example

## src/App.js

This is default react's App.js file where you need to use the `<SdFlcReactRouterPages/>` component:

```js
import React from 'react';
import './App.css';
import SdFlcReactRouterPages from '@sdflc/react-router-pages';
import siteMap from './siteMap';
import MainLayout from './layouts/layoutMain';

function App() {
  return (
    <SdFlcReactRouterPages
      siteMap={siteMap}
      layout={MainLayout}
      componentsMap={componentsMap}
      failoverComponent={({ failoverFor, page, children }) => {
        console.log('Failover:', failoverFor, page);
        return (<div data-failover={failoverFor}>{children}</div>);
      }}
      roles={['manager','admin']} // this prop will not allow to render pages that have not empty `page` which should be a string array

    />
  );
}

export default App;

```

## src/componentsMap.js

This is the file that exports an mapping object.

```js
import LayoutNotFound from './layouts/layoutNotFound';
import {
  ContentPage,
  ProjectsPage,
  ProjectEditPage,
  NotFoundPage,
  UsersPage
} from './pages';

const componentsMap = {
  content: ContentPage,
  projects: ProjectsPage,
  projectEdit: ProjectEditPage,
  users: UsersPage,
  notFound: NotFoundPage,
  layoutNotFound: LayoutNotFound
};

export default componentsMap;
```

## src/siteMap.js

This is the file where you define your site map - array of objects with pages names, urls and their hierarchical structure:

```js
import LayoutNotFound from './layouts/layoutNotFound';
import {
  ContentPage
} from './pages';

const siteMap = [
  {
    name: 'Home',
    subtitle: 'welcome to the app',
    url: '/',
    component: 'content', // note that we use string we would hook up with the componentsMap.
    options: {
      some: 'Test'
    },
    items: [
      {
        name: 'About',
        subtitle: '',
        url: '/about',
        component: ContentPage // note that we use component here
      },
      {
        name: 'Projects',
        subtitle: 'manage your projects on the page',
        url: '/projects',
        component: 'projects', // note that we use string we would hook up with the componentsMap.
        roles: ['manager'], // make sure we render the page only if <SdFlcReactRouterPages/> has 'manager' in its `roles` array.
        items: [
          {
            name: 'Edit',
            subtitle: 'project settings',
            url: '/projects/edit/:projectId',
            component: 'projectEdit', // note that we use string we would hook up with the componentsMap.
            visible: false,
            options: {
              mode: 'edit'
            }
          }
        ]
      },
      {
        name: 'Not Found',
        url: '*',
        component: 'notFound', // note that we use string we would hook up with the componentsMap.
        layout: 'layoutNotFound' // note that we use string we would hook up with the componentsMap.
      }
    ]
  }
];

export default siteMap;
```

## src/components/Navigation/index.js

```js
import React from 'react';
import { Link } from 'react-router-dom';
import { processRoutes } from '@sdflc/react-router-pages';

/**
 * Renders layout's navigation menu. 
 * Note: props.page has information on the current page.
 * @param {object} props - the component properties
 */
const Navigation = (props) => {
  const { siteMap } = props;
  const parentUrl = (props.page.parent || {}).url || '';
  const menu = processRoutes(siteMap).filter(page => (!page.parent || page.parent.url === '/') && page.visible === true);
  const lastPageIdx = menu.length - 1;
  const menuItems = menu.map((page, idx) => {
    return (
      <React.Fragment>
        <Link to={page.url}>{page.name}</Link>
        {idx < lastPageIdx && (
          <span> | </span>
        )}
      </React.Fragment>
    );
  });

  return (
    <div>
      <p>
        {menuItems}
        {parentUrl && (
          <React.Fragment>
            <span> | </span>
            <Link to={props.page.parent.url}>Go Back</Link>
          </React.Fragment>
        )}
      </p>
    </div>
  );
};

export default Navigation;
```

## src/layouts/layoutMain.js

This is default layout for this example. You may want to ommit using layout component. In this example we add navigation menu to the layout which is used by all the pages.

```js
import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '../components';

const MainLayout = ({ children, page }) => {
  return (
    <div style={{ backgroundColor: '#fefefe', padding: '20px'}}>
      <Navigation {...{ page }} />
      {children}
    </div>
  )
};

export  default MainLayout;

```

## src/layouts/layoutNotFound.js

This is a layout used by the `PageNotFound` page component. You may want to ommit using page level layout components.

```js
const LayoutNotFound = ({ children }) => {
  return (
    <div style={{ backgroundColor: '#333', color: '#fff', padding: '20px'}}>
      {children}
    </div>
  );
}

export default LayoutNotFound;
```

## src/layouts/layoutRolesDontMatch

```js
import React from 'react';
import { Navigation } from '../components';

const RolesDontMatchLayout = ({ children, page, siteMap }) => {
  return (
    <div style={{ backgroundColor: '#880000', padding: '20px', color: 'white' }}>
      <Navigation {...{ page, siteMap }} />
      {children}
    </div>
  )
};

export  default RolesDontMatchLayout;
```

## src/pages/index.js

This is a demo file with pages components referenced to from the siteMap array.

```js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = (props) => {
  return (
    <div>
      <h1>
        <span>{props.page.name}&nbsp;</span>
        {props.page.subtitle && <small>{props.page.subtitle}</small>}
      </h1>
      <hr/>
    </div>
  );
}

const ContentPage = (props) => {
  return (
    <div>
      <Header {...props} />
      <h3>Page props:</h3>
      <pre>{JSON.stringify(props, null, '  ')}</pre>
    </div>
  )
};

const ProjectsPage = (props) => {
  return (
    <div>
      <Header {...props} />
      <p>List of projects:</p>
      <Link to='/projects/edit/1'>Edit Project 1</Link>
    </div>
  )
};

const ProjectEditPage = (props) => {
  return (
    <div>
      <Header {...props} />
      <h3>Page props:</h3>
      <pre>{JSON.stringify(props, null, '  ')}</pre>
    </div>
  )
};

const NotFoundPage = () => {
  return (
    <div>Not Found</div>
  )
};

const FailoverPage = ({ failoverFor, children, ...rest }) => {
  return (
    <div>
      <h2>Failover for {failoverFor}</h2>
      <h3>Page props:</h3>
      <pre style={{ backgroundColor: 'transparent' }}>{JSON.stringify(rest, null, '  ')}</pre>
      <h3>Page:</h3>
      {children}
    </div>
  );
};

const RolesDontMatchPage = (props) => {
  return (
    <div>
      <Header {...props} />
      <h2>Access Denied</h2>
      <h3>Page props:</h3>
      <pre style={{ backgroundColor: 'transparent' }}>{JSON.stringify(props, null, '  ')}</pre>
    </div>
  );
};

export {
  ContentPage,
  ProjectsPage,
  ProjectEditPage,
  NotFoundPage,
  FailoverPage,
  RolesDontMatchPage
};
```