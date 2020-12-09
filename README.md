# @sdflc / React Router Pages

This is a simple helper component that uses an array with a list of web application pages to render `react-router-dom` component `<Route>` for each page from that URL.
In some cases it may simplify web application page management.

# Installation

```
npm install @sdflc/react-router-pages
```

# Usage

To start using the component you need to follow the steps:
- create pages components - components that represent each page. For an example, see below file `./pages/index.js`
- create a layout component(s) - components that wrap each page. For an example, see below file `./layouts/layoutMain.js`
- create a site map array - the array should contain information about all the pages. For an example, see below file `./siteMap.js`
- use `<SdFlcReactRouterPages/>` instead of `react-router-dom` `<Route>` components in the App.js file as this component will render them for you.

## Properties

### siteMap

The __required__ `siteMap` property is an array containing items of the following structure:

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
  items: [], // An array of pages that go under the page. For example, if this is the '/projects' page, you can add '/projects/add' or '/projects/edit/:projectId' 
}
```

### layout

The __optional__ `layout` prop is used to wrap all the pages components with this one. It can be used to define default pages layout containing navigation menu, footer, etc.
If a page has its own `layout` prop then it will be used instead of global one.

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
    />
  );
}

export default App;

```

## siteMap.js

This is the file where you define your site map - array of objects with pages names, urls and their hierarchical structure:

```js
import LayoutNotFound from './layouts/layoutNotFound';
import {
  ContentPage,
  ProjectsPage,
  ProjectEditPage,
  NotFoundPage
} from './pages';

const siteMap = [
  {
    name: 'Home',
    subtitle: 'Welcome to the app',
    url: '/',
    component: ContentPage,
    options: {
      some: 'Test'
    },
    items: [
      {
        name: 'About',
        subtitle: '',
        url: '/about',
        component: ContentPage
      },
      {
        name: 'Projects',
        url: '/projects',
        component: ProjectsPage,
        items: [
          {
            name: 'Edit',
            url: '/projects/edit/:projectId',
            component: ProjectEditPage,
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
        component: NotFoundPage,
        layout: LayoutNotFound
      }
    ]
  }
];

export default siteMap;
```

## layouts/layoutMain.js

This is default layout for this example. You may want to ommit using layout component.

```js
const MainLayout = ({ children }) => {
  return (
    <div style={{ backgroundColor: '#fefefe', padding: '20px'}}>
      {children}
    </div>
  )
};

export  default MainLayout;
```

## layouts/layoutNotFound.js

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

## pages/index.js

This is a demo file with pages components referenced to from the siteMap array.

```js
import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = (props) => {
  const parentUrl = (props.page.parent || {}).url || '';
  return (
    <p>
      <Link to={'/'}>Home</Link>
      <span> | </span>
      <Link to={'/about'}>About</Link>
      <span> | </span>
      <Link to={'/projects'}>Projects</Link>
      {parentUrl && (
        <React.Fragment>
          <span> | </span>
          <Link to={props.page.parent.url}>Go Back</Link>
        </React.Fragment>
      )}
    </p>
  );
}

const ContentPage = (props) => {
  return (
    <div>
      <h1>{props.page.name}</h1>
      <Navigation {...props} />
      <h3>Page props:</h3>
      <pre>{JSON.stringify(props, null, '  ')}</pre>
    </div>
  )
};

const ProjectsPage = (props) => {
  return (
    <div>
      <h1>Projects</h1>
      <Navigation {...props} />
      <p>List of projects:</p>
      <Link to='/projects/edit/1'>Edit Project 1</Link>
    </div>
  )
};

const ProjectEditPage = (props) => {
  const { page } = props;
  return (
    <div>
      <h1>Project Edit</h1>
      <Navigation {...props} />
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

export {
  ContentPage,
  ProjectsPage,
  ProjectEditPage,
  NotFoundPage
};
```