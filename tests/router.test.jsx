import { describe, it, expect } from 'vitest';
import React from 'react';
import { processRoutes } from '../src/utils';

// Test Components
const HomePage = () => <div>Home</div>;
const AboutPage = () => <div>About</div>;
const DashboardPage = () => <div>Dashboard</div>;
const DashboardEditPage = () => <div>Dashboard</div>;

// Test Data
const siteMap = [
  {
    name: 'Home',
    subtitle: 'Welcome to the app',
    url: '/',
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

describe('Router Pages Utils', () => {
  it('processRoutes should correctly flatten sitemap hierarchy', () => {
    const parsed = processRoutes(siteMap);
    
    const expecting = [
      {
        parent: null,
        name: siteMap[0].name,
        subtitle: siteMap[0].subtitle,
        url: siteMap[0].url,
        urlmask: siteMap[0].urlmask,
        component: siteMap[0].component,
        visible: true,
        level: 1,
        options: siteMap[0].options,
        items: siteMap[0].items,
        roles: []
      },
      {
        parent: {
          name: siteMap[0].name,
          url: siteMap[0].url,
          urlmask: siteMap[0].urlmask
        },
        name: siteMap[0].items[0].name,
        subtitle: siteMap[0].items[0].subtitle,
        url: siteMap[0].items[0].url,
        urlmask: siteMap[0].items[0].urlmask,
        component: siteMap[0].items[0].component,
        visible: true,
        level: 2,
        options: siteMap[0].items[0].options,
        items: [],
        roles: []
      },
      {
        parent: {
          name: siteMap[0].name,
          url: siteMap[0].url,
          urlmask: siteMap[0].urlmask
        },
        name: siteMap[0].items[1].name,
        subtitle: siteMap[0].items[1].subtitle,
        url: siteMap[0].items[1].url,
        urlmask: siteMap[0].items[1].urlmask,
        component: siteMap[0].items[1].component,
        visible: true,
        level: 2,
        options: siteMap[0].items[1].options,
        items: siteMap[0].items[1].items,
        roles: []
      },
      {
        parent: {
          name: siteMap[0].items[1].name,
          url: siteMap[0].items[1].url,
          urlmask: siteMap[0].items[1].urlmask
        },
        name: siteMap[0].items[1].items[0].name,
        subtitle: siteMap[0].items[1].items[0].subtitle,
        url: siteMap[0].items[1].items[0].url,
        urlmask: siteMap[0].items[1].items[0].urlmask,
        component: siteMap[0].items[1].items[0].component,
        visible: false,
        level: 3,
        options: siteMap[0].items[1].items[0].options,
        items: [],
        roles: []
      },
    ];

    expect(parsed.length).toBe(expecting.length);
    
    parsed.forEach((page, idx) => {
      expect(page).toEqual(expect.objectContaining(expecting[idx]));
    });
  });
});