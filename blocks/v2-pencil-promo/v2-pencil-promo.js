import {
  getImageURLs,
  createResponsivePicture,
  variantsClassesToBEM,
} from '../../scripts/common.js';

export default async function decorate(block) {
  const blockName = 'v2-pencil-promo';
  const variantClasses = ['pencil-banner-black', 'pencil-banner-copper', 'promo-banner-gold', 'promo-banner-copper'];
  variantsClassesToBEM(block.classList, variantClasses, blockName);

  const pencilBanners = document.querySelectorAll('.v2-pencil-promo--pencil-banner-black, .v2-pencil-promo--pencil-banner-copper');
  const promoBanners = document.querySelectorAll('.v2-pencil-promo--promo-banner-gold, .v2-pencil-promo--promo-banner-copper');

  pencilBanners.forEach((pencilBanner) => {
    pencilBanner.classList.add(`${blockName}__pencil-banner`);
    pencilBanner.parentElement.classList.add('full-width');
  });
  promoBanners.forEach((promoBanner) => promoBanner.classList.add(`${blockName}__promo-banner`));

  pencilBanners.forEach((banner) => {
    const bannerImage = banner.querySelector('picture');
    if (bannerImage !== null) {
      bannerImage.remove();
    }
  });

  const images = [...block.querySelectorAll('p > picture')];
  const imageURLs = getImageURLs(images);
  const imageData = imageURLs.map((src) => ({ src, breakpoints: [] }));

  if (imageData.length === 1) {
    imageData[0].breakpoints = [
      { media: '(min-width: 600px)', width: 600 },
      { media: '(min-width: 1200px)', width: 1200 },
      { media: '(min-width: 1440px)', width: 1440 },
      { media: '(min-width: 1920px)', width: 1920 },
      { width: 750 },
    ];
  }

  if (imageData.length > 1) {
    imageData[0].breakpoints = [
      { media: '(min-width: 600px)', width: 600 },
      { width: 750 },
    ];

    imageData[1].breakpoints = [
      { media: '(min-width: 1200px)', width: 1200 },
      { media: '(min-width: 1440px)', width: 1440 },
      { media: '(min-width: 1920px)', width: 1920 },
    ];
  }

  const altText = [...block.querySelectorAll('p > picture img.alt')];
  const newPicture = createResponsivePicture(imageData, true, altText, `${blockName}__image`);
  images.forEach((image) => image.parentNode.remove());

  block.prepend(newPicture);

  const contentWrapper = block.querySelector(':scope > div');
  contentWrapper.classList.add(`${blockName}__content-wrapper`);

  const content = block.querySelector(':scope > div > div');
  content.classList.add(`${blockName}__content`);

  const ctaButtons = content.querySelectorAll('.button-container > a');
  [...ctaButtons].forEach((b) => {
    // b.classList.add(`${blockName}__cta`, 'button--cta');
    b.classList.remove('button', 'button--primary');
    b.parentElement.classList.remove('button-container');
    b.parentElement.removeAttribute('class');
  });

  const bannerLinks = block.querySelectorAll('a');

  bannerLinks.forEach((link) => {
    const closestParent = link.closest(`.${blockName}`);
    closestParent.addEventListener('click', () => {
      const linkHref = link.getAttribute('href');
      if (linkHref) {
        window.location.href = linkHref;
      }
    });
  });
}
