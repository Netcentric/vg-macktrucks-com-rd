import { variantsClassesToBEM } from '../../scripts/common.js';

export default async function decorate(block) {
  const blockName = 'v2-cards';
  const variantClasses = ['no-background', 'gray-cards', 'horizontal', 'image-aspect-ratio-7-5', 'large-heading'];
  variantsClassesToBEM(block.classList, variantClasses, blockName);

  const cardsItems = [...block.querySelectorAll(':scope > div')];
  cardsItems.forEach((el) => el.classList.add(`${blockName}__card-item`));

  const cardsSections = [...block.querySelectorAll(':scope > div > div')];
  cardsSections.forEach((el) => {
    el.classList.add(`${blockName}__text-wrapper`);
  });

  const pictures = [...block.querySelectorAll('picture')];
  pictures.forEach((el) => {
    el.classList.add(`${blockName}__picture`);
    el.parentElement.classList.add(`${blockName}__picture-wrapper`);
    el.parentElement.classList.remove(`${blockName}__text-wrapper`);
  });

  const images = [...block.querySelectorAll('img')];
  images.forEach((el) => el.classList.add(`${blockName}__image`));

  const cardsHeadings = [...block.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  cardsHeadings.forEach((el) => el.classList.add(`${blockName}__heading`));

  const buttons = [...block.querySelectorAll('.button-container')];
  buttons.forEach((el) => {
    el.classList.add(`${blockName}__button-container`);
    [...el.querySelectorAll('a')].forEach((link) => {
      const up = link.parentElement;
      if (
        up.childNodes.length === 1
        && up.tagName === 'STRONG'
      ) {
        link.className = 'button button--small button--primary';
      }
      if (
        up.childNodes.length === 1
        && up.tagName === 'EM'
      ) {
        link.className = 'button button--small button--secondary';
      } else {
        link.classList.add('standalone-link', `${blockName}__button`);
        link.classList.remove('button', 'button--primary');
      }
    });
  });
}
