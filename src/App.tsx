import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import cv from "@techstark/opencv-js";

import "./App.css";
import { processImage,isCanvasBlank } from "./imageProcessing";

const videoConstraints: any = {
  width: 200,
  height: 200,
  sampleSize: 10,
  facingMode: "environment",
  zoom: 4,
  //focusDistance: 0.1,
};

function App() {
  const refresh = () => window.location.reload();
  const webcamRef: any = React.useRef(null);
  const imgRef: any = React.useRef(null);
  const inRef: any = React.useRef(null);
  const outRef: any = React.useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [detectedPixels, setDetectedPixels] = useState(0);
  const [time, setTime] = useState(0);
  let prendido :boolean = false;
  const alfa :number = 15000;
  const beta :number = 1000;
  const [cantidad_de_corte, setCantidad_de_corte] = useState(-1);
  const [tiempo_init, setTiempo_init] = useState(-1);
  const [tiempo_end, setTiempo_end] = useState(-1);
  const [TRC, setTRC] = useState(-1);
  const [entroAlfa,setEntroAlfa]=useState(false);
  //Aca podes comentar para que apareca o no
  let DEBUG=true;
  let [resultado,setResultado] = useState(0);
  let [torchonoff,setTorch] = useState(false);
  // let [dorefresh,setRefresh] = useState(false);

  useEffect(() => {
    if(DEBUG)console.log( `START- ######## [${torchonoff},     ${detectedPixels},   ${alfa},  ${beta},   ${tiempo_init},   ${tiempo_end}]`);
    if (TRC>-1){
      let nueva=(Date.now()-TRC);
      if(DEBUG)console.log( "tiempo trans ="+nueva);
    }else{
      if(DEBUG)console.log( "tiempo tasn = 0");
    }
    setTRC(Date.now());
    //TRC =Date.now();

    
    if (detectedPixels > alfa){
      //Aca estoy apretado
      if(DEBUG)console.log("detectedPixels > alfa");
      setCantidad_de_corte(detectedPixels) ;
      setEntroAlfa(true);
      
    } else if (detectedPixels >= beta && cantidad_de_corte>-1){
        //Aca el dedo se esta llenando de sangre
        if(DEBUG)console.log("beta <= detectedPixels< alfa");
        if (tiempo_init ==-1){
          //Aca entra la primera vez que el detectedPixels< alfa
          //tiempo_init = Date.now();        
          setTiempo_init(Date.now());
          if(DEBUG)console.log("tiempo init =" + tiempo_init);
        }
    } else if (tiempo_init>-1 && detectedPixels<beta && cantidad_de_corte>-1){
      if(DEBUG) console.log("detectedPixels < beta");
      //tiempo_end = Date.now();
      setTiempo_end(Date.now());
      if(DEBUG)console.log("tiempo end =" + tiempo_end);
      
    }else if (detectedPixels<beta && cantidad_de_corte>-1){
      if(DEBUG)console.log("NO tengo que entro aca NUNCA "+tiempo_init);
      
    }

    if (tiempo_init>-1 && tiempo_end>-1){
        //Aca calculo el tiempo y reinicio los contadores podria entrar en la linea luego de console.log("tiempo end =" + tiempo_end);
      if(DEBUG)console.log("TIEMPO TRANSCURRIDO ES = "+((tiempo_end-tiempo_init)/1000)+" segundos");
      //tiempo_init = -1; 
      //tiempo_end = -1;
      //cantidad_de_corte=-1;
      setTiempo_init(-1);
      setTiempo_end(-1);
      setCantidad_de_corte(-1);
      setEntroAlfa(false);
      setResultado(resultado=((tiempo_end-tiempo_init)/1000));
    } 
    if(DEBUG)console.log( "END- ########");
 
  }, [resultado, detectedPixels]);

  useEffect(() => {
    const process = async () => {
      //debugger;
      const imageSrc = webcamRef?.current?.getScreenshot();
      if (webcamRef?.current?.stream!==undefined){
        let track = webcamRef?.current?.stream.getVideoTracks()[0];
        const capa = track.getCapabilities();
        const settings = track.getSettings();  
        // console.log(capa);
        // console.log(settings);
        if (!('zoom' in settings)) {
          return Promise.reject('Zoom is not supported by ' + track.label);
        }
        track.applyConstraints({
          advanced: [
            {torch: torchonoff},
          ]
        });
      }
    
      if (!imageSrc) return;

      return new Promise((resolve: any) => {
      
        imgRef.current.src = imageSrc;
        imgRef.current.onload = () => {
          try {
            const img = cv.imread(imgRef.current);
            const proccessedData = processImage(img);
            if (torchonoff) {
              setDetectedPixels(proccessedData.detectedPixels);
              cv.imshow(inRef.current, proccessedData.image);
            } else {
            cv.imshow(inRef.current, proccessedData.croppedImage);
            }
            img.delete();

          resolve();
          } catch (error) {
            console.log(error);
            refresh();
            resolve();
          }
        };
      });
    };

    let handle: any;
    const nextTick = () => {
      handle = requestAnimationFrame(async () => {
        await process();
        nextTick();
      });
    };
    nextTick();
    return () => {
      cancelAnimationFrame(handle);
    };
  });

  const startTimer = () => {
    setIsActive((value) => !value);
  };

  const stopTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(0);
  };

  const onloadWebCam=()=>{
    debugger;
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        // text: 'Chart.js Line Chart',
      },
    },
  };
  
  const labels = [time];
  
  const data = {  
    labels,
    datasets: [
      {
        label: 'Intensidad canal rojo',
        data: detectedPixels,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };
  
  const turnTorch = () => {
    setTorch((torchonoff) => !torchonoff);
  }

  return (
    <div className="App">
      <div className="camera">
        <Webcam
          ref={webcamRef}
          className="webcam"
          onLoad={onloadWebCam}
          imageSmoothing={false}
          screenshotFormat="image/jpeg"
          style={{ position: "absolute", opacity: 0, width: 200, height: 200 }}
          videoConstraints={videoConstraints}
          audio={false}
          screenshotQuality={1}
        />
        <img
          className="inputImage"
          alt="input"
          ref={imgRef}
          style={{ opacity: 0, position: "absolute", top: 0, left: 0 }}
        />
        <canvas
          ref={inRef}
          style={{
            width: 300,
            height: 300,
          }}
        />
        {/* <canvas
          ref={outRef}
          style={{
            width: 200,
            height: 200,
          }}
        /> */}
      </div>
      <div style={{ alignContent: "center", width: "100%", marginTop: 20 }}>
        <span> Pixeles detectados: {detectedPixels}</span>
        <br />
        <br /> 
        <span> El TRC es de: {resultado} seg. </span>
        <br />
        <br />
        <button onClick={turnTorch}>LED ON/OFF</button>
      </div>
    </div>
    
  );
}

export default App;
