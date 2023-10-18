import {
  createElement, generateId, getTextLabel,
} from '../../scripts/common.js';
import { createOptimizedPicture, decorateIcons } from '../../scripts/lib-franklin.js';

const blockClass = 'header';

const desktopMQ = window.matchMedia('(min-width: 1200px)');
const tabsVarinats = {
  TAB_WITH_CARDS: 'tabs-with-cards',
  TAB: 'tabs',
};

const createLogo = (logoWrapper) => {
  const logoImage = logoWrapper.querySelector('span.icon');
  const logoLink = logoImage.parentElement.tagName === 'A' ? logoImage.parentElement : null;

  logoImage.classList.add(`${blockClass}__logo-image`);
  (logoLink || logoImage).classList.add(`${blockClass}__logo-image-wrapper`);

  return logoLink || logoImage;
};

const createMainLinks = (mainLinksWrapper) => {
  const list = mainLinksWrapper.querySelector('ul');

  list.setAttribute('id', 'header-main-nav');
  list.classList.add(`${blockClass}__main-nav`);
  list.querySelectorAll('li').forEach((listItem) => {
    const accordionContainer = document.createRange().createContextualFragment(`
      <div class="${blockClass}__accordion-container ${blockClass}__main-link-wrapper">
        <div class="${blockClass}__accordion-content-wrapper">
        </div>
        <div class="desktop-wrapper"></div>
      </div>
    `);

    listItem.classList.add(`${blockClass}__main-nav-item`);
    listItem.append(accordionContainer);

    const mainNavLink = listItem.querySelector('a');
    mainNavLink.setAttribute('id', generateId('main-nav'));
  });
  list.querySelectorAll('li > a').forEach((link) => {
    link.classList.add(`${blockClass}__main-nav-link`, `${blockClass}__link`, `${blockClass}__link-accordion`);
  });

  const closeMenuLabel = getTextLabel('Close menu');
  const closeIcon = document.createRange().createContextualFragment(`
    <li class="${blockClass}__action-item ${blockClass}__action-item--close-menu">
      <button
        aria-label="${closeMenuLabel}"
        class="${blockClass}__close-menu"
        aria-expanded="false"
        aria-controls="header-main-nav, header-actions-list"
      >
        <span class="icon icon-close" />
      </button>
    </li>
  `);

  list.prepend(closeIcon);

  return list;
};

const createActions = (actionsWrapper) => {
  const list = actionsWrapper.querySelector('ul');

  list.setAttribute('id', 'header-actions-list');
  list.classList.add(`${blockClass}__actions-list`);
  list.querySelectorAll('li').forEach((listItem) => {
    listItem.classList.add(`${blockClass}__action-item`);
  });
  list.querySelectorAll('li > a').forEach((link) => {
    link.classList.add(`${blockClass}__action-link`, `${blockClass}__link`);

    // wrapping text nodes into spans &
    // adding aria labels (because text labels are hidden on mobile)
    [...link.childNodes]
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .forEach((textNode) => {
        const spanWrapper = createElement('span', { classes: [`${blockClass}__action-link-text`] });

        textNode.replaceWith(spanWrapper);
        spanWrapper.append(textNode);
        link.setAttribute('aria-label', textNode.textContent);
      });
  });

  return list;
};

const mobileActions = () => {
  const mobileActionsEl = createElement('div', { classes: [`${blockClass}__mobile-actions`] });
  const searchLable = getTextLabel('Search');
  const openMenuLable = getTextLabel('Open menu');

  const actions = document.createRange().createContextualFragment(`
    <a
      href="#"
      aria-label="${searchLable}"
      class="${blockClass}__search-button ${blockClass}__action-link ${blockClass}__link"
    >
      <span class="icon icon-search"></span>
    </a>
    <button
      aria-label="${openMenuLable}"
      class="${blockClass}__hamburger-menu ${blockClass}__action-link ${blockClass}__link"
      aria-expanded="false"
      aria-controls="header-main-nav, header-actions-list"
    >
      <span class="icon icon-hamburger"></span>
    </button>
  `);

  mobileActionsEl.append(...actions.childNodes);

  return mobileActionsEl;
};

const rebuildCategoryItem = (item) => {
  item.classList.add(`${blockClass}__category-item`);

  [...item.childNodes].forEach((el) => {
    // unwrapping images & links inside paragraphs
    if (el.tagName === 'P' && el.querySelectorAll(':scope > picture, :scope > a').length === 1) {
      el.replaceWith(el.children[0]);
    }

    // second list of links should be rendered as buttons
    if (item.querySelector(':scope > ul:nth-of-type(2)') === el) {
      el.classList.add(`${blockClass}__category-item-buttons`);

      [...el.querySelectorAll('a')].forEach((button, index) => {
        if (!index) {
          button.classList.add('button', 'button--primary');
        } else {
          button.classList.add('button', 'button--secondary');
        }
      });
    }
  });

  const firstLink = item.querySelector(':scope > a:first-of-type');

  if (firstLink?.previousElementSibling?.tagName === 'PICTURE') {
    firstLink.classList.add(`${blockClass}__link--after-image`);
  }
};

const optimiseImage = (picture) => {
  const img = picture.querySelector('img');
  const newPicture = createOptimizedPicture(img.src, img.alt, false, [
    { media: '(min-width: 1200px) and (min-resolution: 2x)', width: '568' },
    { media: '(min-width: 1200px)', width: '284' },
  ]);

  picture.replaceWith(newPicture);
};

/* transformMenuData unify HTML that comes from word doc */
const transformMenuData = (data) => {
  // for each tab
  data.forEach((menuData) => {
    const titles = menuData.querySelectorAll('.menu > div > div:first-child > a');
    // unwrapping the titles (.menu > div > div > a => .menu > a)
    titles.forEach((title) => title.parentElement.parentElement.replaceWith(title));

    // changing divs to lists
    const menusContentList = [...menuData.querySelectorAll('.menu')];

    // for each menu tab sub items
    menusContentList.forEach((menuItem) => {
      // for tracks menu only
      if (menuItem.classList.contains(tabsVarinats.TAB_WITH_CARDS)) {
        // changing the structure to list
        const item = menuItem.querySelectorAll(':scope > div > div');
        const listEl = createElement('ul');

        item.forEach((mItem) => {
          const listItemEl = createElement('li');
          mItem.parentElement.remove();
          listItemEl.append(...mItem.children);
          listEl.append(listItemEl);
        });

        menuItem.append(listEl);
      } else {
        // for other manu types,
        // unwrapp the list:
        // .menu > div > div > ul => .menu > ul
        const listEl = menuItem.querySelector('ul');
        menuItem.children[1].replaceWith(listEl);
      }
    });

    [...menuData.querySelectorAll('picture')].forEach(optimiseImage);
  });

  const results = document.createRange().createContextualFragment(`
    <div>
      ${data.map((el) => el.outerHTML).join('')}
    </div>
  `);

  return results.children[0];
};

const onAccordionItemClick = (el) => {
  const elClassList = el.target.classList;
  const isMainLink = elClassList.contains(`${blockClass}__main-nav-link`);
  const isTabLink = elClassList.contains(`${blockClass}__tab-link`);

  if (desktopMQ.matches && (!isMainLink && !isTabLink)) {
    return;
  }

  el.preventDefault();

  const menuEl = el.target.parentElement;
  menuEl.classList.toggle(`${blockClass}__menu-open`);
  const isExpanded = menuEl.classList.contains(`${blockClass}__menu-open`);
  el.target.setAttribute('aria-expanded', isExpanded);

  if (isMainLink) {
    // closing other open menus - on desktop
    if (desktopMQ.matches && menuEl.classList.contains(`${blockClass}__main-nav-item`)) {
      const openMenus = document.querySelectorAll(`.${blockClass}__menu-open`);

      [...openMenus].filter((menu) => menu !== menuEl).forEach((menu) => {
        menu.classList.remove(`${blockClass}__menu-open`);
        menu.querySelector(':scope > a').setAttribute('aria-expanded', false);
      });
    }

    // disabling scroll when menu is open
    document.body.classList[isExpanded ? 'add' : 'remove']('disable-scroll');
  }

  if (isTabLink) {
    const targetId = el.target.closest('[menu-accordion-id]').getAttribute('menu-accordion-id');
    const tabContent = document.querySelector(`#${targetId}`);

    [...tabContent.parentElement.querySelectorAll(`.${blockClass}__accordion-container`)].forEach((item) => {
      if (item !== tabContent) {
        item.setAttribute('data-active', 'false');
      }
    });

    tabContent.setAttribute('data-active', 'true');
  }
};

const buildMenuContent = (menuData, navEl) => {
  const menus = transformMenuData(menuData);
  const navLinks = [...navEl.querySelectorAll(`.${blockClass}__main-nav-link`)];

  [...menus.children].forEach((menuItemData) => {
    const tabName = menuItemData.querySelector(':scope > p > a');
    const categories = [...menuItemData.querySelectorAll(':scope > div')];
    const navLink = navLinks.find((el) => el.textContent.trim() === tabName.textContent.trim());
    const accordionContentWrapper = navLink?.closest(`.${blockClass}__main-nav-item`).querySelector(`.${blockClass}__accordion-content-wrapper`);

    categories.forEach((cat) => {
      const title = cat.querySelector(':scope > a');
      const list = cat.querySelector(':scope > ul');
      let extraClass = '';

      title?.classList.add(`${blockClass}__link`, `${blockClass}__link-accordion`, `${blockClass}__menu-heading`);

      if (cat.classList.contains(tabsVarinats.TAB_WITH_CARDS)
        || cat.classList.contains(tabsVarinats.TAB)
      ) {
        title?.classList.add(`${blockClass}__tab-link`);
      }

      if (cat.classList.contains(tabsVarinats.TAB_WITH_CARDS)) {
        extraClass = `${blockClass}__main-link-wrapper--${tabsVarinats.TAB_WITH_CARDS}`;
      }

      if (cat.classList.contains(tabsVarinats.TAB)) {
        extraClass = `${blockClass}__main-link-wrapper--${tabsVarinats.TAB}`;
      }

      list.classList.add(`${blockClass}__category-items`);
      [...list.querySelectorAll('li')].forEach(rebuildCategoryItem);
      [...list.querySelectorAll('a')].forEach((el) => el.classList.add(`${blockClass}__link`));

      let menuContent;

      if (!title) {
        menuContent = document.createRange().createContextualFragment(`
          <div class="${blockClass}__menu-content">
            ${list.outerHTML}
          </div>
        `);
      } else {
        menuContent = document.createRange().createContextualFragment(`
        <div class="${blockClass}__menu-content">
          ${title.outerHTML}
          <div class="${blockClass}__category-content ${blockClass}__accordion-container">
            <div class="${blockClass}__accordion-content-wrapper">
              ${list.outerHTML}
            </div>
          </div>
        </div>
      `);
      }

      menuContent.querySelector(`.${blockClass}__link-accordion`)?.addEventListener('click', onAccordionItemClick);
      accordionContentWrapper.append(menuContent);
      if (extraClass) {
        accordionContentWrapper.parentElement.classList.add(extraClass);
      }
    });

    navLink?.addEventListener('click', onAccordionItemClick);
  });
};

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // clear the block
  block.textContent = '';

  // fetch nav content
  const { pathname } = new URL(window.location.href);
  const langCodeMatch = pathname.match('^(/[a-z]{2}(-[a-z]{2})?/).*');
  const navPath = `${langCodeMatch ? langCodeMatch[1] : '/'}drafts/tdziezyk/v2/nav`;
  const resp = await fetch(`${navPath}.plain.html`);

  if (!resp.ok) {
    // eslint-disable-next-line no-console
    console.error(`Header is not loaded: ${resp.status}`);
  }

  // get the navigation text, turn it into html elements
  const content = document.createRange().createContextualFragment(await resp.text());

  const [
    logoContainer,
    navigationContainer,
    actionsContainer,
    ...menuContent
  ] = content.children;
  const nav = createElement('nav', { classes: [`${blockClass}__nav`] });
  const navContent = document.createRange().createContextualFragment(`
    <div class="${blockClass}__menu-overlay"></div>
    ${createLogo(logoContainer).outerHTML}
    <div class="${blockClass}__main-links">
      ${createMainLinks(navigationContainer).outerHTML}
    </div>
    <div class="${blockClass}__actions">
      ${mobileActions().outerHTML}
      ${createActions(actionsContainer).outerHTML}
    </div>
  `);

  const setAriaForMenu = (isMenuVisible) => {
    nav.querySelectorAll(`.${blockClass}__close-menu, .${blockClass}__hamburger-menu`).forEach((control) => {
      control.setAttribute('aria-expanded', isMenuVisible);
    });
    nav.querySelectorAll('#header-main-nav, #header-actions-list').forEach((item) => {
      item.setAttribute('aria-hidden', !isMenuVisible);
    });
  };

  const initAriaForAccordions = () => {
    const menuPrefix = 'menu-accordion';
    const accordionContainers = block.querySelectorAll(`.${blockClass}__link-accordion ~ .${blockClass}__accordion-container`);

    [...accordionContainers].forEach((container) => {
      const id = generateId(menuPrefix);
      const accordionLink = container.parentElement.querySelector(`.${blockClass}__link-accordion`);

      container.setAttribute('id', id);
      accordionLink.setAttribute('aria-controls', id);
      accordionLink.setAttribute('aria-expanded', false);
      accordionLink.parentElement.setAttribute('menu-accordion-id', id);
    });
  };

  const closeHamburgerMenu = () => {
    block.classList.remove(`${blockClass}--hamburger-open`);
    document.body.classList.remove('disable-scroll');

    block.querySelectorAll(`.${blockClass}__menu-open`).forEach((el) => {
      el.classList.remove(`${blockClass}__menu-open`);
      el.setAttribute('aria-expanded', 'false');
    });

    setAriaForMenu(false);
  };

  // add actions for search
  navContent.querySelector(`.${blockClass}__search-button`).addEventListener('click', () => {
    window.location.href = '/search-results';
  });

  // add action for hamburger
  navContent.querySelector(`.${blockClass}__hamburger-menu`).addEventListener('click', () => {
    block.classList.add(`${blockClass}--hamburger-open`);
    document.body.classList.add('disable-scroll');

    setAriaForMenu(true);
  });

  navContent.querySelectorAll(`.${blockClass}__menu-overlay, .${blockClass}__close-menu`).forEach((el) => {
    el.addEventListener('click', closeHamburgerMenu);
  });

  // hiding the hamburger menu when switch to desktop
  desktopMQ.addEventListener('change', closeHamburgerMenu);

  nav.append(navContent);
  block.append(nav);

  setAriaForMenu(false);
  buildMenuContent(menuContent, nav);
  initAriaForAccordions();

  // hiding nav when clicking outside the menu
  document.addEventListener('click', (event) => {
    const isTargetOutsideMenu = !event.target.closest(`.${blockClass}__main-nav`) && !event.target.closest('.header__actions');
    const openMenu = block.querySelector(`.${blockClass}__main-nav-item.${blockClass}__menu-open`);

    if (isTargetOutsideMenu && openMenu) {
      openMenu.classList.remove(`${blockClass}__menu-open`);
      openMenu.setAttribute('aria-expanded', false);
      document.body.classList.remove('disable-scroll');
    }
  });

  const swapMenuMountPoint = (isDesktop) => {
    const menus = [...document.querySelectorAll('.header__category-content.header__accordion-container')];

    if (isDesktop) {
      menus.forEach((item) => {
        const desktopMountPoint = item.closest(`.${blockClass}__main-link-wrapper`).querySelector('.desktop-wrapper');

        desktopMountPoint.append(item);
      });
    } else {
      menus.forEach((item) => {
        const mobileMountPoints = [...item.closest(`.${blockClass}__main-link-wrapper`).querySelectorAll('.header__menu-content')];
        const mountPoint = mobileMountPoints.find((el) => el.getAttribute('menu-accordion-id') === item.getAttribute('id'));

        mountPoint.append(item);
      });
    }
  };

  const swapActionsLinks = (isDesktop) => {
    const actionsLinks = document.querySelector('#header-actions-list');
    const actionsLinksDesktopMountPoint = document.querySelector('.header__actions');
    const headerMainNav = document.querySelector('.header__main-links'); // mobile actions links mount point

    if (isDesktop) {
      actionsLinksDesktopMountPoint.append(actionsLinks);
    } else {
      headerMainNav.append(actionsLinks);
    }
  };

  desktopMQ.addEventListener('change', (e) => {
    const isDesktop = e.matches;

    swapMenuMountPoint(isDesktop);
    swapActionsLinks(isDesktop);
  });

  swapMenuMountPoint(desktopMQ.matches);
  swapActionsLinks(desktopMQ.matches);
  decorateIcons(block);
}
