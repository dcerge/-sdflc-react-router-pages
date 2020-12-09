/**
 * Adds a page to the allPages array and if the page has subpages then adds them too in a recursive way.
 * @param {array} allPages an array that accumulates pages information from site map in flat structure
 * @param {number} level current page level, when it is 1 then this is the toppes level of a page
 * @param {object} parent main information about the page parent: name and url
 * @param {array} pages an array with hierarchial pages information
 */
const addLevel = (allPages, level, parent, pages) => {
  pages.forEach((page) => {
    page.parent = parent;

    allPages.push({
      parent: parent,
      level,
      name: page.name,
      subtitle: page.subtitle,
      url: page.url,
      urlmask: page.urlmask,
      visible: page.visible !== undefined ? page.visible : true,
      options: page.options,
      component: page.component,
      layout: page.layout,
      items: page.items || [],
    });

    if (page.items) {
      addLevel(allPages, level + 1, { name: page.name, url: page.url, urlmask: page.urlmask }, page.items);
    }
  });
};

/**
 * Processes provided site map configuration and returns an array of configuration for react router.
 * An item of siteMap looks like:
 * {
 *  name: 'Name of the page',
 *  subtitle: 'Subtitle for the page',
 *  url: 'Relative path to the page',
 *  urlMask: 'Regular expression for relative path to the page',
 *  component: A reference to component to use to render the page,
 *  layout: A reference to component to use to wrap the page (layout),
 *  visible: is a boolean which can be used to build navigation menu automatically and do not show this page in the navigation,
 *  options: an object with options needed by the page to render/operate,
 *  items: an array of similar object that are located 'below' of this page (hierarchy).
 * }
 * @param {array} siteMap an array of objects with site map configuration.
 * @returns {array} An array of objects with configuration for react router
 */
const processRoutes = (siteMap) => {
  const allPages = [];
  addLevel(allPages, 1, null, siteMap);

  return allPages;
};

/**
 * Searches a page in an array returned by processRoutes.
 * @param {string} url Url to look up page configuration.
 * @returns {number} An index of found page or -1 if such page not found.
 */
const findPageByUrl = (url) => {
  const fs = flattenSitemap();

  const idx = fs.findIndex((f) => {
    const p = f.url ? f.url.search(':') : -1;
    const ul = p > 0 ? f.url.substr(0, p) : f.url;
    const ur = p > 0 ? url.substr(0, p) : url;
    return ul === ur;
  });

  return idx !== -1 ? fs[idx] : null;
};

export {
  processRoutes,
  findPageByUrl
};
