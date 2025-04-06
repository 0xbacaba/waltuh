type Dataset = {
  label: string,
  style: string | CanvasPattern | CanvasGradient,
  data: number[],
};
type ChartOptions = {
  padding?: Sides,
  dotsize?: number,
  scaleTickLength?: number,
};
type Scales = {
  xmax: number,
  xmin: number,
  ymax: number,
  ymin: number,
}

class Sides {
  top: number;
  right: number;
  bottom: number;
  left: number;

  /**
   * Construct a [Sides] object. The parameters work the same as in css fields like padding or margin.
   *
   * @param all_vert_top will evaluate to all (if 1 param), vertical (if 2 params) or top (if >3 params)
   * @param horiz_right will evaluate to horizontal (if 2 or 3 params) or right (if 4 params)
   * @param bottom will evaluate to bottom
  */
  public constructor(all_vert_top: number, horiz_right?: number, bottom?: number, left?: number) {
    if (horiz_right == undefined) {
      this.top = this.right = this.bottom = this.left = all_vert_top;
    } else if (bottom == undefined) {
      this.top = this.bottom = all_vert_top;
      this.right = this.left = horiz_right;
    } else if (left == undefined) {
      this.top = all_vert_top;
      this.right = this.left = horiz_right;
      this.bottom = bottom;
    } else {
      this.top = all_vert_top;
      this.right = horiz_right;
      this.bottom = bottom;
      this.left = left;
    }
  }
}

class Chart {
  private datasets: Dataset[];
  private options: ChartOptions;

  public constructor(datasets: Dataset[], options: ChartOptions) {
    this.datasets = datasets;
    this.options = options;
  }

  /**
   * Calculate the x and y scales from the datasets
   */
  private calculateScales(): Scales {
    let xmax = -Infinity, ymax = -Infinity;
    let ymin = Infinity;
    for (let i = 0; i < this.datasets.length; i++) {
      let data = this.datasets[i].data;
      for (let j = 0; j < data.length; j++) {
        ymax = Math.max(ymax, data[j]);
        ymin = Math.min(ymin, data[j]);
      }
      xmax = Math.max(xmax, data.length - 1);
    }
    return { xmax: xmax, xmin: 0, ymax: ymax, ymin: ymin }
  }
  /**
   * Get the options with default values for unset fields.
   * The result type is similar to ChartOptions but with no optional values
   */
  public getOptions() {
    const dotsize = this.options.dotsize ?? 4;
    const padding = this.options.padding ?? { top: dotsize, right: dotsize, bottom: dotsize, left: dotsize }
    const scaleTickLength = this.options.scaleTickLength ?? 2;
    return {
      padding,
      dotsize,
      scaleTickLength,
    }
  }
  /**
   * Calculate where to put a point on the graph
   *
   * @param x the x value
   * @param y the y value
   * @param width the width of the graph area
   * @param height the height of the graph area
   * @param scales the x and y scales
   * @param padding the padding in the graph area
   */
  private calculatePoint(x: number, y: number, width: number, height: number, scales: Scales, padding: Sides): { x: number, y: number } {
    const xsteps = width / (scales.xmax - scales.xmin);
    const ysteps = height / (scales.ymax - scales.ymin);
    return {
      x: xsteps * (x - scales.xmin) + padding.left,
      y: height - ysteps * (y - scales.ymin) + padding.top,
    };
  }

  /**
   * Draw the graphs scale
   *
   * @param width the width of the graph area
   * @param height the height of the graph area
   * @param scales the x and y scales
   * @param maxTextWidth the maximum text width (includes [textToScalePad])
   * @param maxTextHeight the maximum text height (includes [textToScalePad])
   * @param padding the padding in the graph area
   * @param textToScalePad the padding of the text to the scale
  */
  private drawScale(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    scales: Scales,
    maxTextWidth: number,
    maxTextHeight: number,
    padding: Sides,
    textToScalePad: number
  ) {
    const graphLeftPad = padding.left + maxTextWidth;
    context.strokeStyle = "white";
    context.beginPath();
    context.moveTo(graphLeftPad, padding.top);
    context.lineTo(graphLeftPad, padding.top + height);
    context.lineTo(graphLeftPad + width, padding.top + height);
    context.stroke();

    const xsteps = width / (scales.xmax - scales.xmin);
    const ysteps = height / (scales.ymax - scales.ymin);

    const { scaleTickLength } = this.getOptions();
    const startX = graphLeftPad - scaleTickLength;
    const endX = graphLeftPad + scaleTickLength;
    const yScaleCount = (scales.ymax - scales.ymin);
    for (let i = scales.ymin + 1; i <= yScaleCount; i++) {
      let y = padding.top + height - ysteps * i;

      context.beginPath();
      context.moveTo(startX, y);
      context.lineTo(endX, y);
      context.stroke();

      const isFarFromLast = yScaleCount - i > 1
      const isFirst = i == 1;
      const isLast = i == yScaleCount;

      // every fifth tick is rendered, first and last are always rendered, 
      // second to last will not be rendered if it is too close to the last
      if ((i % 5 == 0 && isFarFromLast) || isFirst || isLast) {
        let text = `${i}`;
        let textWidth = context.measureText(text).width + textToScalePad;
        context.strokeText(text, padding.left + maxTextWidth / 2 - textWidth / 2, y + maxTextHeight / 2);
      }
    }
    const startY = padding.top + height - scaleTickLength;
    const endY = padding.top + height + scaleTickLength;
    const xScaleCount = (scales.xmax - scales.xmin);
    for (let i = scales.xmin; i <= xScaleCount; i++) {
      let x = graphLeftPad + xsteps * i;

      context.beginPath();
      context.moveTo(x, startY);
      context.lineTo(x, endY);
      context.stroke();

      let text = `${i}`;
      let textWidth = context.measureText(text).width;
      context.strokeText(text, x - textWidth / 2, padding.top + height + maxTextHeight + textToScalePad);
    }
  }
  /**
   * Draw a single Dataset
   *
   * @param dataset the dataset
   * @param width the width of the graph area
   * @param height the height of the graph area
   * @param scales the x and y scales
   * @param graphPadding the padding in the graph area
   */
  private drawDataset(
    context: CanvasRenderingContext2D,
    dataset: Dataset,
    width: number,
    height: number,
    scales: Scales,
    graphPadding: Sides
  ) {
    const { dotsize } = this.getOptions();

    let data = dataset.data;
    let style = dataset.style;
    context.fillStyle = context.strokeStyle = style;
    context.lineWidth = 2;
    for (let j = 0; j < data.length; j++) {
      let { x, y } = this.calculatePoint(j, data[j], width, height, scales, graphPadding);

      context.fillRect(x - dotsize / 2, y - dotsize / 2, dotsize, dotsize);

      if (j > 0) {
        let { x: lastX, y: lastY } = this.calculatePoint(j - 1, data[j - 1], width, height, scales, graphPadding);
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(lastX, lastY);
        context.stroke();
      }
    }
  }

  /**
   * Draw the chart on the given html canvas. 
   * This method will not resize the element, but it will set the elements resolution equal to its size.
   *
   * @param element the html canvas element
   */
  public draw(element: HTMLCanvasElement) {
    let context = element.getContext("2d");
    if (context == null)
      throw `Could not get context of canvas`;

    const { padding, scaleTickLength } = this.getOptions();

    // fix canvas resolution
    const { width: fullWidth, height: fullHeight } = element.getBoundingClientRect();
    element.width = fullWidth;
    element.height = fullHeight;

    const scales = this.calculateScales();
    const textMetrics = context.measureText(`${scales.ymax}`);
    const textToScalePad = 4;
    const textWidth = textMetrics.width + scaleTickLength + textToScalePad;
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent + textToScalePad;

    const width = fullWidth - padding.left - padding.right - textWidth;
    const height = fullHeight - padding.top - padding.bottom - textHeight;

    this.drawScale(context, width, height, scales, textWidth, textHeight, padding, textToScalePad);

    const graphPadding = {
      top: padding.top,
      right: padding.right,
      bottom: padding.bottom,
      left: padding.left + textWidth
    };

    for (let i = 0; i < this.datasets.length; i++) {
      this.drawDataset(context, this.datasets[i], width, height, scales, graphPadding);
    }
  }
}
