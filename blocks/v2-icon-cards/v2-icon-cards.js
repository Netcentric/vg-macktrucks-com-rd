import { isVideoLink } from '../../scripts/video-helper.js';
import { createElement } from '../../scripts/common.js';

export default async function decorate(block) {
  const blockName = 'v2-icon-cards';

  const rows = [...block.querySelectorAll(':scope > div')];
  const columns = [...block.querySelectorAll(':scope > div > div')];

  rows.forEach((row) => {
    row.classList.add(`${blockName}__row`);
  });

  const parentSection = block.parentElement.parentElement;
  const hasHeader = parentSection.classList.contains('header-with-mark');
  const hasExtraColumn = columns.length === 4;

  if (hasExtraColumn) block.classList.add(`${blockName}--4-cols`);
  if (hasExtraColumn && hasHeader) parentSection.querySelector('.default-content-wrapper').classList.add(`${blockName}--4-cols`);

  columns.forEach((col, idx) => {
    const isExtraColumn = idx === 3;
    col.classList.add(`${blockName}__column`);

    const allTextElmts = col.querySelectorAll('p');
    const bodyElmts = [];

    allTextElmts.forEach((e) => {
      const nextElmt = e.nextElementSibling;

      const isButton = [...e.classList].includes('button-container');
      const isPretitle = nextElmt?.tagName.toLowerCase()[0] === 'h';

      if (!isPretitle && !isButton) bodyElmts.push(e);
    });
    bodyElmts.forEach((e) => e.classList.add(`${blockName}__body`));

    const buttons = [...col.querySelectorAll('.button-container a')];
    buttons.forEach((btn) => {
      btn.classList.add('button', 'button--large', 'button--primary');

      if (btn.parentElement.classList.contains('button-container')) {
        btn.parentElement.replaceWith(btn);
      }
    });

    if (isExtraColumn) {
      col.classList.add(`${blockName}__column--extra-col`);
      const link = col.querySelector('a');
      const isVideo = isVideoLink(link);

      if (isVideo) {
        const playIcon = document.createRange().createContextualFragment(`
        <a class="${blockName}__videoBtn" href="${link.href}">
        ${link.title}
        <span class="icon icon-play">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <path stroke="var(--color-icon, #000)" d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"/>
        <path stroke="var(--color-icon, #000)" stroke-linecap="round" stroke-linejoin="round" d="m10 8 6 4-6 4V8Z"/>
        </svg>
        </span>
        </a>`);

        link.append(...playIcon.children);
        link.classList.add(`${blockName}__video-icon`);
        col.append(link);
      }
    }

    const headings = [...col.querySelectorAll('h1, h2, h3, h4, h5, h6')];
    headings.forEach((heading) => heading.classList.add(`${blockName}__heading`, 'h2'));

    // icons
    [...col.querySelectorAll('.icon')].forEach((icon) => {
      const iconParentEl = icon.parentElement;
      if (iconParentEl.children.length === 1) {
        iconParentEl.replaceWith(icon);
      }
    });

    const prevEl = headings[0]?.previousElementSibling;
    const pretitleText = prevEl && !prevEl.classList.contains('icon') && prevEl.textContent;

    if (pretitleText) {
      const pretitle = createElement('span', { classes: 'pretitle' });
      pretitle.textContent = pretitleText;
      prevEl.replaceWith(pretitle);
    }
  });

  const headings = [...block.querySelectorAll('h3, h4, h5, h6')];
  const h2List = [...block.querySelectorAll('h2')];

  headings.forEach((h) => {
    h.classList.add('h5');
    h.classList.remove('h2');
  });

  h2List.forEach((h) => {
    h.classList.add('with-marker', 'h2');
    h.classList.remove('h1');
    h.closest(`.${blockName}__column`)?.classList.add(`${blockName}__column--main`);
  });

  // replacing headings (h3, h4, h5, h6) with strong so the block will not break semantic
  // (example breaking semantic: col 1 -> h5, col 2 -> h2)
  headings.forEach((heading) => {
    const newHeadingEl = createElement('strong', { classes: [...heading.classList] });
    newHeadingEl.innerHTML = heading.innerHTML;
    heading.replaceWith(newHeadingEl);
  });

  const buttons = [...block.querySelectorAll('.button-container a')];
  buttons.forEach((button) => {
    button.classList.add('standalone-link', `${blockName}__button`);
    button.classList.remove('button', 'button--primary', 'button--large');
  });
}
