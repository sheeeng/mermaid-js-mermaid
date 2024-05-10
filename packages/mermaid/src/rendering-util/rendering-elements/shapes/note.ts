import { log } from '$root/logger.js';
import { labelHelper, updateNodeBounds } from './util.js';
import intersect from '../intersect/index.js';
import { getConfig } from '$root/diagram-api/diagramAPI.js';
import type { Node } from '$root/rendering-util/types.d.ts';
import rough from 'roughjs';

export const note = async (parent: SVGAElement, node: Node) => {
  const { themeVariables } = getConfig();
  const { noteBorderColor, noteBkgColor } = themeVariables;

  const useHtmlLabels = node.useHtmlLabels;
  if (!useHtmlLabels) {
    node.centerLabel = true;
  }
  const { shapeSvg, bbox, halfPadding } = await labelHelper(
    parent,
    node,
    'node ' + node.classes,
    true
  );

  log.info('Classes = ', node.classes);
  const { style, useRough } = node;
  let rect;
  const totalWidth = bbox.width + node.padding;
  const totalHeight = bbox.height + node.padding;
  const x = -bbox.width / 2 - halfPadding;
  const y = -bbox.height / 2 - halfPadding;

  if (useRough) {
    // add the rect
    const rc = rough.svg(shapeSvg);
    const roughNode = rc.rectangle(x, y, totalWidth, totalHeight, {
      roughness: 0.7,
      fill: noteBkgColor,
      fillStyle: 'solid', // solid fill'
      stroke: noteBorderColor,
    });

    rect = shapeSvg.insert(() => roughNode, ':first-child');
    rect.attr('class', 'basic label-container').attr('style', style);
  } else {
    rect = shapeSvg.insert('rect', ':first-child');
    rect
      .attr('rx', node.rx)
      .attr('ry', node.ry)
      .attr('x', x)
      .attr('y', y)
      .attr('width', totalWidth)
      .attr('height', totalHeight);
  }

  updateNodeBounds(node, rect);

  node.intersect = function (point) {
    return intersect.rect(node, point);
  };

  return shapeSvg;
};
