import { readBlockConfig, decorateIcons, loadBlocks } from '../../scripts/lib-franklin.js';
import { createElement, getTextLabel } from '../../scripts/scripts.js';

const PLACEHOLDERS = {
  visit: getTextLabel('visit aria label'),
  social: getTextLabel('social aria label'),
  channel: getTextLabel('channel aria label'),
};

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  const blockName = block.getAttribute('data-block-name');
  block.textContent = '';

  const footerPath = cfg.footer || '/drafts/avinash/footer';
  const resp = await fetch(`${footerPath}.plain.html`);
  const html = await resp.text();
  const footer = createElement('div', 'v2-footer-container');
  footer.innerHTML = html;

  // // adding the 'block' class and 'data-block-name'
  // // needed to load blocks
  const eloquaFormEl = footer.querySelector('.eloqua-form');
  eloquaFormEl?.classList.add('block');
  eloquaFormEl?.setAttribute('data-block-name', 'eloqua-form');

  const socialMediaSection = footer.querySelector('.icon-twitter, .icon-facebook, .icon-twitter, .icon-linkedin, .icon-instagram, .icon-youtube')?.closest('ul');
  socialMediaSection?.classList.add('v2-footer-social-media-section');

  const firstHeader = [...footer.querySelectorAll('h3')].at(1);

  const fourthHeader = [...footer.querySelectorAll('h3')].at(-1);
  const [firstLinks, secondLinks, thirdLinks, fourthLinks, fifthLinks] = [...footer.querySelectorAll('h3 ~ ul')];
  secondLinks.classList.add('v2-pre-footer-list-item');

  const headings = footer.querySelectorAll('h1, h2, h3, h4, h5, h6');
  [...headings].forEach((heading) => heading.classList.add(`${blockName}__title`));

  // secondLinks?.classList.add('footer-links-col-2');

  // // creating the  logo link
  const picture = footer.querySelector('picture');
  let logoLink = null;

  if (picture) {
    logoLink = picture.closest('div').querySelector('p');
    logoLink?.classList.add('footer-logo-link');

    logoLink.innerHTML = '';
    logoLink.append(picture);
  }

  const bottomLinksList = [...footer.querySelectorAll('ul')].at(-1);
  bottomLinksList?.classList.add('v2-footer-bottom-section-content');

  const formSection = footer.querySelector('.eloqua-form');
  formSection?.classList.add('v2-footer-form-section');

  const footerTemplate = `
    <div class="v2-pre-footer">
      <div class="v2-pre-footer-content">
        ${firstLinks.outerHTML}
      </div>
      <div class="v2-pre-footer-list-wrapper">
          <div class="v2-pre-footer-list">
            ${firstHeader?.outerHTML}
            ${secondLinks?.outerHTML}
          </div>
      </div>
    </div>
    <div class="v2-footer-content">
      <div class="v2-footer-main-content">
        <div class="v2-footer-logo-section">
          ${logoLink?.outerHTML}
        </div>
        <div class="v2-footer-social-section">
          ${socialMediaSection?.outerHTML}
        </div>
        <div class="v2-footer-links-section">
          ${thirdLinks?.outerHTML}
          ${fourthLinks?.outerHTML}
          ${fifthLinks?.outerHTML}
        </div>
        <div class="v2-footer-form-section">
            <div class="form v2-footer-form-header">
              ${fourthHeader?.outerHTML}
            </div>
            <div class="form footer-form">
              ${formSection?.outerHTML}
            </div>
          </div>
      </div>
      <div class="v2-footer-bottom-section">
        ${bottomLinksList?.outerHTML}
      </div>
    </div>
  `;

  const fragment = document.createRange().createContextualFragment(footerTemplate);
  block.appendChild(fragment);
  // block.append(footer);

  block.querySelectorAll('.v2-pre-footer-list-wrapper')[0].addEventListener('click', (e) => toggleExpand(e.target));

  // // make links to open in another browser tab/window
  const socialLinks = block.querySelectorAll('.v2-footer-social-media-section a');
  [...socialLinks].forEach((a) => { a.target = '_blank'; });

  await decorateIcons(block);
  await loadBlocks(block);

  const targetNode = block.querySelector('.eloqua-form.block');
  const observerOptions = {
    childList: true,
    attributes: false,
    subtree: true,
  };
  let observer = null;
  let submitButtonFixed = false;
  let checkboxFixed = false;
  const onFormLoaded = (mutationList) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const mutation of mutationList) {
      if (submitButtonFixed && checkboxFixed) {
        observer.disconnect();
        return;
      }

      if (mutation.type === 'childList') {
        const submitButton = block.querySelector('input[type="submit"]');
        const emailInput = block.querySelector('input[name="emailAddress"]');
        const label = emailInput.parentElement.querySelector('label');
        const emailAndSubmitContainer = createElement('span', ['email-and-submit-container']);

        // change the submit button to arrow button
        // and display it sticked to the right side of email input
        if (submitButton && emailInput) {
          const parent = emailInput.parentElement;
          submitButton.value = '';
          emailAndSubmitContainer.append(emailInput, submitButton);
          parent.append(emailAndSubmitContainer);

          if (label) {
            emailInput.setAttribute('placeholder', label.innerText.replace('*', '').trim());
            label.remove();
          }

          submitButtonFixed = true;
        }

        const checkbox = block.querySelector('.checkbox-span input[type="checkbox"]');
        const checkboxLabel = block.querySelector('.checkbox-span .checkbox-label');
        // customization of the checkbox
        if (checkbox && checkboxLabel) {
          const checkboxId = 'footer-subscribe-checkbox';
          const checkboxParent = checkbox.parentElement;
          checkbox.setAttribute('id', checkboxId);
          checkboxLabel.setAttribute('for', checkboxId);
          checkboxParent.classList.add('confirm-checkbox');

          if (emailInput) {
            // showing the checkbox only when the user start typing
            emailInput.addEventListener('input', () => { checkboxParent.classList.add('show'); }, { once: true });
          }

          checkboxFixed = true;
        }
      }
    }
  };

  function findList(ele) {
    if (ele.classList.contains('v2-pre-footer-list')) {
      return ele;
    }
    return findList(ele.parentElement);
  }

  function toggleExpand(targetH3) {
    const clickedColumn = findList(targetH3);
    const isExpanded = clickedColumn.classList.contains('expand');
    const wrapper = targetH3.closest('.v2-pre-footer-list-wrapper');
    const columns = wrapper.querySelectorAll('.v2-pre-footer-list');

    columns.forEach((column) => {
      const content = column.querySelector('.v2-pre-footer-list-item');
      if (column === clickedColumn && !isExpanded) {
        column.classList.add('expand');
        content.style.maxHeight = `${content.scrollHeight}px`;
      } else {
        column.classList.remove('expand');
        content.style.maxHeight = null;
      }
    });
  }

  function displayScrollToTop(buttonEl) {
    const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    buttonEl.style.display = scrollTop > 160 ? 'block' : 'none';
  }

  function goToTopFunction() {
    const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    let timeOut;

    if (scrollTop !== 0) {
      window.scrollBy(0, -50);
      timeOut = setTimeout(goToTopFunction, 10);
      return;
    }

    clearTimeout(timeOut);
  }

  function addScrollToTopButton(mainEl) {
    const scrollToTopButton = createElement('button', ['scroll-to-top', 'button'], { title: 'Go to the top of the page' });
    const icon = createElement('i', ['fa', 'fa-angle-up']);
    scrollToTopButton.appendChild(icon);

    scrollToTopButton.addEventListener('click', goToTopFunction);
    window.addEventListener('scroll', () => displayScrollToTop(scrollToTopButton));
    mainEl.append(scrollToTopButton);
  }

  observer = new MutationObserver(onFormLoaded);
  observer.observe(targetNode, observerOptions);

  addScrollToTopButton(block);
}
