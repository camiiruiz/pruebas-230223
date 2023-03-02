import cv, { CV_8U, CV_8UC1, CV_8UC3 } from "@techstark/opencv-js";

export function processImage(img) {
  const original = img;
  const newImg = new cv.Mat();
  let image2 =original.clone();

  cv.cvtColor(image2, newImg, cv.COLOR_RGB2HSV,0);
 
  let channels = new cv.MatVector();
  cv.split(newImg,channels);
  let H = channels.get(0);

  // let nchannels = new cv.MatVector(0);
  const histSize = 32;
  const ranges = [0,179];
  let hist = new cv.Mat();
  let mask = new cv.Mat();
  
  // Initialise a MatVector
  let matVec = new cv.MatVector();
  // Push a Mat back into MatVector
  matVec.push_back(newImg);

  // let uniform = true; 
  // let accumulate = false;

  // if (matVec==undefined) {
  //   console.log("matvec"+matVec);
  // }
  
  //   // if (H==undefined){
  //   //   console.log("H"+H);
  //   // }
  
  //   if (undefined==undefined){
  //     console.log("undef");
  //   }
    
  //   if (histSize==undefined){
  //     console.log("histSize"+histSize);
  //   }
  
  //   if (ranges==undefined){
  //     console.log("ranges"+ranges);
  //   }
  
  //   if (mask==undefined){
      console.log("histSize "+histSize);
      console.log("ranges "+ranges);
    // }

  cv.calcHist(channels,1,mask,hist,histSize,ranges);

  let lowerb = cv.matFromArray(1, 3, CV_8UC1, [12, 0, 0]);
  let upperb = cv.matFromArray(1, 3, CV_8UC1, [22, 255, 255]);

  cv.inRange(newImg, lowerb, upperb, newImg);

  let M = cv.Mat.ones(5, 5, cv.CV_8U);
  cv.morphologyEx(newImg,newImg, cv.MORPH_ERODE, M);

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(newImg, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
  cv.drawContours(image2,contours,-1,[0,0,0,1],4);
  
  // cv.circle(image2, result.minLoc, 0, [0, 0, 255,0], 4);

  return {
    image: image2,
    croppedImage: newImg,
    detectedPixels: cv.countNonZero(newImg),
  };
}

