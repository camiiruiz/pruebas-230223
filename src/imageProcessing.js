import cv, { CV_8UC1 } from "@techstark/opencv-js";

export function processImage(img) {
  const original = img;
  const newImg = new cv.Mat();
  let image2 =original.clone();

  // let rect = new cv.Rect(0, 0, 70, 70);
  // image2=image2.roi(rect);

  cv.cvtColor(image2, newImg, cv.COLOR_RGB2HSV,0);
 
  let channels = new cv.MatVector();
  cv.split(newImg,channels);
  let H = channels.get(0);
  // // let prom = new cv.Mat();
  // // let dev = new cv.Mat();
  // let res = new cv.mean(chred);
  // let mask = new cv.Mat();

  let accumulate = false;
  let channelz = [0];
  let histSize = [256];
  let ranges = [0, 180];
  let hist = new cv.Mat();
  let mask = new cv.Mat();

  // You can try more different parameters
  //cv.calcHist(H, channelz, mask, hist, histSize, ranges, accumulate);

  let result = cv.minMaxLoc(H);

  console.log(result);

  let lowerb = cv.matFromArray(1, 3, CV_8UC1, [14, 0, 0]);
  let upperb = cv.matFromArray(1, 3, CV_8UC1, [25, 255, 255]);

  cv.inRange(newImg, lowerb, upperb, newImg);
  // cv.multiply(newImg,image2,newImg);
  // let M = cv.Mat.ones(6, 6, cv.CV_8U);
  // cv.morphologyEx(newImg,newImg, cv.MORPH_OPEN, M);

  return {
    image: image2,
    croppedImage: newImg,
    //detectedPixels: result,
    detectedPixels: cv.countNonZero(newImg),
  };
}
// returns true if every pixel's uint32 representation is 0 (or "blank")
export function  isCanvasBlank(canvas) {
  const context = canvas.getContext('2d');

  const pixelBuffer = new Uint32Array(
    context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
  );

  return !pixelBuffer.some(color => color !== 0);
}
