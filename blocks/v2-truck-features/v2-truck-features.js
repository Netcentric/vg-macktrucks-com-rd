import { createElement, unwrapDivs, variantsClassesToBEM } from '../../scripts/common.js';
import { getAllElWithChildren } from '../../scripts/scripts.js';

const blockName = 'v2-truck-features';
const desktopMQ = window.matchMedia('(min-width: 1200px)');

const preventEventWhenSlideExists = (deltaY, settings, event) => {
  // preventing scolling only when there is
  // next (when scrolling down) / prev (when scrolling up) slide
  if ((deltaY > 0 && settings.hasNextSlide) || (deltaY < 0 && settings.hasPrevSlide)) {
    event.preventDefault();
    event.stopPropagation();
  }
};

const onWheel = (e, settings) => {
  if (settings.isSlideChangeBlocked) {
    return;
  }

  settings.currentDelta += e.deltaY;

  if (Math.abs(settings.currentDelta) > settings.scrollThreshold) {
    if (settings.currentDelta > 0) {
      settings.hasNextSlide = settings.showNextSlide();
      settings.hasPrevSlide = true;
    } else {
      settings.hasPrevSlide = settings.showPrevSlide();
      settings.hasNextSlide = true;
    }

    settings.currentDelta = 0;
    settings.isSlideChangeBlocked = true;

    setTimeout(() => {
      settings.isSlideChangeBlocked = false;
    }, settings.slideChangeTime);
  }
};

const selectImagesList = (slide) => {
  const imagesLists = [...getAllElWithChildren(slide.querySelectorAll('ul'), ':scope > li > picture')];

  if (imagesLists === 0) {
    return;
  }

  imagesLists.forEach((el) => {
    el.style.display = 'none';
  });

  const selectedImagesListIndex = desktopMQ.matches ? '-1' : '0';

  imagesLists.at(selectedImagesListIndex).style.display = 'block';
  imagesLists.at(selectedImagesListIndex).classList.add(`${blockName}__images-list`);
};

export default async function decorate(block) {
  const activeSlideClass = `${blockName}__slide--active`;
  const activeSlideImageClass = `${blockName}__slide-image--active`;
  const variantClasses = ['image-left'];
  variantsClassesToBEM(block.classList, variantClasses, blockName);

  [...block.querySelectorAll(':scope > div')].forEach(unwrapDivs);

  const heading = block.querySelector(':scope > div > :is(h1, h2, h3, h4, h5, h6)');
  const rows = [...block.querySelectorAll(':scope > div')].slice(1);
  const list = createElement('ul', { classes: `${blockName}__slides` });

  heading.parentElement.replaceWith(heading);
  heading.classList.add(`${blockName}__heading`);

  // moving the rows to list
  rows.forEach((el) => {
    const newEl = createElement('li', { classes: `${blockName}__slide` });
    const textWrapper = createElement('div', { classes: `${blockName}__text-wrapper` });

    newEl.innerHTML = el.innerHTML;

    const descriptionHeading = newEl.querySelector(':scope > :is(h1, h2, h3, h4, h5, h6)');
    const description = newEl.querySelector(':scope > p');

    descriptionHeading.replaceWith(textWrapper);
    textWrapper.append(descriptionHeading, description);

    el.remove();
    list.append(newEl);
    selectImagesList(newEl);
  });

  block.append(list);

  // setting the first slide as active
  let activeSlide = list.children[0];
  activeSlide.classList.add(activeSlideClass);
  // setting the first image in the first slide active
  let activePicListItem = activeSlide.querySelector('.v2-truck-features__images-list li');
  activePicListItem.classList.add(activeSlideImageClass);

  const showNextSlide = () => {
    const nextImageInSlide = block.querySelector(`.${activeSlideImageClass} + li`);
    let hasNextSlide = true;

    // if there is a next image in the same slide just switch image
    if (nextImageInSlide) {
      activePicListItem.classList.remove(activeSlideImageClass);
      nextImageInSlide.classList.add(activeSlideImageClass);
      activePicListItem = nextImageInSlide;
    } else {
      // if no next image in slide switch to next slide
      const nextSlide = block.querySelector(`.${activeSlideClass} + li`);

      if (nextSlide) {
        activeSlide.classList.remove(activeSlideClass);
        nextSlide.classList.add(activeSlideClass);
        activeSlide = nextSlide;

        activePicListItem.classList.remove(activeSlideImageClass);
        activePicListItem = nextSlide.querySelector('.v2-truck-features__images-list li');
        activePicListItem.classList.add(activeSlideImageClass);
      } else {
        hasNextSlide = false;
      }
    }

    return hasNextSlide;
  };

  const showPrevSlide = () => {
    const prevImageInSlide = block.querySelector(`.${activeSlideImageClass}`).previousElementSibling;
    let hasPrevSlide = true;

    // if there is a prev image in the same slide just switch image
    if (prevImageInSlide) {
      activePicListItem.classList.remove(activeSlideImageClass);
      prevImageInSlide.classList.add(activeSlideImageClass);
      activePicListItem = prevImageInSlide;
    } else {
      // if no prev image in slide switch to prev slide
      const prevSlide = block.querySelector(`.${activeSlideClass}`).previousElementSibling;

      if (prevSlide) {
        activeSlide.classList.remove(activeSlideClass);
        prevSlide.classList.add(activeSlideClass);
        activeSlide = prevSlide;

        activePicListItem.classList.remove(activeSlideImageClass);
        activePicListItem = prevSlide.querySelector('.v2-truck-features__images-list li:last-of-type');
        activePicListItem.classList.add(activeSlideImageClass);
      } else {
        hasPrevSlide = false;
      }
    }

    return hasPrevSlide;
  };

  const settings = {
    currentDelta: 0,
    scrollThreshold: 60,
    slideChangeTime: 300,
    isSlideChangeBlocked: false,
    hasNextSlide: true,
    hasPreviousSlide: false,
    showNextSlide,
    showPrevSlide,
  };

  // adding wheel events
  const wheelEvents = ['wheel', 'mousewheel']; // mousewhell - for Safari on iOS

  wheelEvents.forEach((eventName) => {
    block.addEventListener(eventName, (e) => {
      preventEventWhenSlideExists(e.deltaY, settings, e);

      onWheel(e, settings);
    }, { passive: false });
  });

  // adding touch events
  let touchStartPosition = 0;

  block.addEventListener('touchstart', (e) => {
    touchStartPosition = e.changedTouches[0].pageY;
  });
  block.addEventListener('touchend', (e) => {
    const deltaY = touchStartPosition - e.changedTouches[0].pageY;

    onWheel({ deltaY }, settings);
  });
  block.addEventListener('touchmove', (e) => {
    const deltaY = touchStartPosition - e.changedTouches[0].pageY;

    preventEventWhenSlideExists(deltaY, settings, e);
  });
}
