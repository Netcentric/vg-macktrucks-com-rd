import { createElement, variantsClassesToBEM } from '../../scripts/common.js';

const CLASSES = {
  blockName: 'v2-accordion-column',
  grayBackground: 'gray-background',
  left: 'left',
};

const { blockName, left, grayBackground } = CLASSES;
const variants = Object.values(CLASSES).splice(1);

const addAccordionClass = (item) => {
  const hasPicture = item.querySelector('picture');
  if (hasPicture) item.classList.add(`${blockName}__item-image`);
  else {
    const header = item.querySelector(':is(h1, h2, h3, h4, h5, h6)');
    if (header) header.classList.add(`${blockName}__item-title`);
    item.classList.add(`${blockName}__item-description`);
  }
};

export default function decorate(block) {
  const header = block.querySelector(':scope > div:first-child > div > :first-child');
  const accordionItems = [...block.querySelectorAll(':scope > div:not(:first-child)')];
  const accordionContainer = createElement('div', { classes: `${blockName}__accordion-container` });
  const colGap = createElement('div', { classes: `${blockName}__accordion-gap` });
  const itemsContainer = createElement('div', { classes: `${blockName}__items-container` });
  const hasLeftClass = block.classList.contains(left); // accordion at left side
  const hasGrayBgClass = block.classList.contains(grayBackground); // accordion with gray background
  /** @type {boolean} */
  const isLeftVariant = hasLeftClass
    || (!hasLeftClass && !!accordionItems[0].lastElementChild.querySelector('picture'));
  // remove the gray variant and add it as section class
  if (hasGrayBgClass) {
    const section = 'section';
    const sectionEl = block.closest(`.${section}`);
    block.classList.remove(grayBackground);
    sectionEl.classList.add(grayBackground);
    variantsClassesToBEM(sectionEl.classList, variants, section);
  }
  if (!hasLeftClass && isLeftVariant) block.classList.add(left);
  variantsClassesToBEM(block.classList, variants, blockName);
  header.parentElement.classList.add(`${blockName}__header-wrapper`);
  header.parentElement.parentElement.classList.add(`${blockName}__header-container`);

  // style the header as an h2 with red marker over it
  header.classList.remove('h1', 'h2', 'h3', 'h4', 'h5', 'h6');
  header.classList.add(`${blockName}__header`, 'h2', 'with-marker');

  // is responsibility of the author to add the proper amount of images and text
  accordionItems.forEach((item, i) => {
    const colBtnTitle = createElement('button', {
      classes: `${blockName}__item-header-button`,
      props: { type: 'button' },
    });
    const arrowEl = createElement('div', { classes: [`${blockName}__close`, 'icon'] });
    const dropdownArrowIcon = document.createRange().createContextualFragment(`
      <svg xmlns="http://www.w3.org/2000/svg"><use href="#icons-sprite-dropdown-caret"></use></svg>`);
    const colItems = [...item.querySelectorAll(':scope > div')];

    // add the proper classes to each accordion item
    item.classList.add(`${blockName}__item`);
    if (i === 0) item.classList.add('active');
    colItems.forEach((col) => addAccordionClass(col));
    arrowEl.appendChild(...dropdownArrowIcon.children);
    colBtnTitle.prepend(item.querySelector(`.${blockName}__item-title`), arrowEl);
    colBtnTitle.onclick = () => {
      const active = accordionContainer.querySelector('.active');
      if (active && active !== item) active.classList.remove('active');
      item.classList.toggle('active');
    };
    item.prepend(colGap, colBtnTitle);
    itemsContainer.appendChild(item);
  });

  accordionContainer.append(colGap, itemsContainer);

  block.appendChild(accordionContainer);
}
