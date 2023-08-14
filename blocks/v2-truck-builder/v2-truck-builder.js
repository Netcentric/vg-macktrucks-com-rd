import { createElement, getTextLabel } from '../../scripts/scripts.js';
import { readBlockConfig } from '../../scripts/lib-franklin.js';

const placeholderTexts = getTextLabel('truck builder text');

export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const [title, subtitle, ctaText, bodyOptions, colors] = Object.values(blockConfig);
  const imageNodes = block.querySelectorAll('picture');
  const [bodyLabel, colorLabel] = placeholderTexts.split('[/]');
  const truckBuilderSection = createElement('div', 'truck-builder-section');

  if (imageNodes.length === 1) truckBuilderSection.appendChild(imageNodes[0]);

  const bodySelectSection = createElement('div', 'body-select-section');
  const bodyFieldset = createElement('fieldset', 'body-fieldset');
  const bodyTitle = createElement('legend', 'body-legend');
  bodyTitle.textContent = bodyLabel;
  const bodySet = createElement('div', 'body-set');

  bodyOptions.forEach((body) => {
    const item = createElement('div', 'body-option');
    const input = createElement('input', 'body-input');
    input.type = 'radio';
    const label = createElement('label', 'body-label');
    label.textContent = body;
    item.append(input, label);
    bodySet.appendChild(item);
  });
  bodyFieldset.append(bodyTitle, bodySet);
  bodySelectSection.appendChild(bodyFieldset);

  const colorSelectSection = createElement('div', 'color-select-section');
  const colorFieldset = createElement('fieldset', 'color-fieldset');
  const colorTitle = createElement('legend', 'color-legend');
  colorTitle.textContent = colorLabel;
  const colorSet = createElement('div', 'color-set');

  colors.forEach((color) => {
    const [code, name] = color.split('-');
    const colorName = createElement('span', 'color-name');
    colorName.textContent = name;
    const button = createElement('button', 'color-btn');
    button.type = 'button';
    button.style.backgroundColor = code;
    button.append(colorName);
    colorSet.appendChild(button);
  });
  colorFieldset.append(colorTitle, colorSet);
  colorSelectSection.appendChild(colorFieldset);

  const ctaSection = createElement('div', 'cta-section');
  const ctaTitle = createElement('h3', 'cta-title');
  ctaTitle.textContent = title;
  const ctaSubtitle = createElement('p', 'cta-subtitle');
  ctaSubtitle.textContent = subtitle;
  const ctaButton = createElement('button', 'cta-button');
  ctaButton.textContent = ctaText;
  ctaSection.append(ctaTitle, ctaSubtitle, ctaButton);

  truckBuilderSection.append(bodySelectSection, colorSelectSection);

  block.textContent = '';
  block.append(truckBuilderSection, ctaSection);
}
