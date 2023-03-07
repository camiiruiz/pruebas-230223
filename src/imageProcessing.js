import cv, { CV_8UC1, CV_32S, CV_8U } from "@techstark/opencv-js";

export function processImage(img) {
  const original = img;
  const newImg = new cv.Mat();
  let image2 =original.clone();

  cv.cvtColor(image2, newImg, cv.COLOR_RGB2HSV,0);
 
  let channels = new cv.MatVector();
  cv.split(newImg,channels);
  let H = channels.get(0);

  let hist = new cv.Mat();
  let mask = new cv.Mat();
  
  // Initialise a MatVector
  let matVec = new cv.MatVector();
  // Push a Mat back into MatVector
  matVec.push_back(newImg);

  // cv.calcHist(matVec,0,nchannels,null,hist,[180],[0,179]);

  let lowerb = cv.matFromArray(1, 3, CV_8UC1, [12, 0, 0]);
  let upperb = cv.matFromArray(1, 3, CV_8UC1, [22, 255, 255]);

  cv.inRange(newImg, lowerb, upperb, newImg);

  let M = cv.Mat.ones(5, 5, CV_8U);
  cv.morphologyEx(newImg,newImg, cv.MORPH_ERODE, M);

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(newImg, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
  cv.drawContours(image2,contours,-1,[0,0,0,1],4);
  
  // cv.circle(image2, result.minLoc, 0, [0, 0, 255,0], 4);

  return {
    image: image2,
    croppedImage: image2,
    detectedPixels: cv.countNonZero(newImg),
  };
  
  original.delete();
  newImg.delete();
  image2.delete();
}

// returns true if every pixel's uint32 representation is 0 (or "blank")
export function  isCanvasBlank(canvas) {
  const context = canvas.getContext('2d');

  const pixelBuffer = new Uint32Array(
    context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
  );

  return !pixelBuffer.some(color => color !== 0);
}
