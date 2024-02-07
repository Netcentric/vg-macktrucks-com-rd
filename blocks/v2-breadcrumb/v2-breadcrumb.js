import { readBlockConfig } from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/common.js';

const blockName = 'v2-breadcrumb';
const sectionStatus = 'data-section-status';
const homeText = {
  home: 'home',
  ellipsis: '...',
};

const removePathDash = (str) => str.replace(/-/g, ' ').toLowerCase();

const getPadding = (elCompCSS) => parseInt(elCompCSS.getPropertyValue('padding-left'), 10)
      + parseInt(elCompCSS.getPropertyValue('padding-right'), 10);

const getCrumbsWidth = (block) => {
  const crumbs = block.querySelectorAll(`.${blockName}__crumb`);
  return [...crumbs].reduce((acc, item) => {
    const itemCompCSS = window.getComputedStyle(item);
    return acc + parseInt(itemCompCSS.getPropertyValue('width'), 10);
  }, 0);
};

const getBlockWidth = (block) => {
  const computedCSS = window.getComputedStyle(block);
  const blockWidth = parseInt(computedCSS.getPropertyValue('width'), 10);
  const boxSizing = computedCSS.getPropertyValue('box-sizing');
  const padding = boxSizing === 'border-box' ? getPadding(computedCSS) : 0;
  return blockWidth - padding;
};

const areCrumbsFit = (block) => getCrumbsWidth(block) < getBlockWidth(block);

const newSeparator = () => {
  const separator = createElement('span', { classes: [`${blockName}__crumb-separator`] });
  separator.textContent = '/';
  return separator;
};

export default function decorate(block) {
  const cfg = readBlockConfig(block);
  const hasPath = cfg && Object.hasOwn(cfg, 'path');
  const url = new URL(window.location.href);

  if (hasPath) url.pathname = cfg.path;

  const path = url.pathname.split('/').filter(Boolean);
  const crumbs = path.map((_, i) => {
    const crumbProps = { 'data-content': removePathDash(path[i]) };
    const crumbClasses = [`${blockName}__crumb`];
    if (i !== path.length - 1) {
      crumbProps.href = `/${path.slice(0, i + 1).join('/')}/`;
    } else {
      crumbClasses.push(`${blockName}__crumb--active`);
      crumbProps['aria-current'] = 'page';
    }
    const crumb = createElement('a', { classes: crumbClasses, props: crumbProps });
    crumb.textContent = removePathDash(path[i]);
    crumb.prepend(newSeparator());
    return crumb;
  });
  const homeEl = createElement('a', {
    classes: [`${blockName}__crumb`, `${blockName}__crumb--home`],
    props: { href: '/' },
  });

  homeEl.textContent = homeText.home;
  crumbs.unshift(homeEl);
  block.textContent = '';
  block.append(...crumbs);
  block.parentElement.classList.add('full-width');
  block.setAttribute('aria-label', 'Breadcrumb');

  const CheckCrumbsFits = () => {
    // 1st check if home fits, if not it become an ellipsis
    if (!areCrumbsFit(block)) homeEl.textContent = homeText.ellipsis;
    // if still doesn't fit, remove active crumb
    if (!areCrumbsFit(block)) {
      crumbs.at(-1).textContent = '';
    }
    // if it still doesn't fit again, remove the crumbs from the middle
    if (!areCrumbsFit(block)) {
      let i = 1;
      while (i < crumbs.length - 1 && !areCrumbsFit(block)) {
        crumbs[i].textContent = '';
        i += 1;
      }
    }
  };

  const rObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.contentBoxSize) {
        // add again the content from each item and check if it fits again or not
        homeEl.textContent = homeText.home;
        crumbs.forEach((crumb, i) => {
          if (i === 0) return;
          crumb.textContent = crumb.dataset.content;
          crumb.prepend(newSeparator());
        });
        CheckCrumbsFits();
      }
    });
  });

  const mObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // check if the attribute data-section-status has the value 'loaded'
      if (mutation.attributeName !== sectionStatus) return;
      const section = mutation.target;
      const status = section.getAttribute(sectionStatus);
      if (status !== 'loaded') return;
      CheckCrumbsFits();
      rObserver.observe(block);
      mObserver.disconnect();
    });
  });
  mObserver.observe(block.closest('.section'), {
    childList: true, attributeFilter: [sectionStatus],
  });
}
