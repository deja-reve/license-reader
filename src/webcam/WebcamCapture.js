import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { createWorker } from "tesseract.js";
import { BrowserCodeReader, BrowserPDF417Reader } from "@zxing/browser";

export const WebcamCapture = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [ocr, setOcr] = useState("Recognizing...");
  const [decoded, setDecoded] = useState(null);
  const canvasRef = useRef(null);

  const doOCR = async () => {
    const worker = await createWorker("eng");
    const ret = await worker.recognize(imageSrc);
    setOcr(ret.data.text);

    await worker.terminate();
  };

  const decodeBarcode = async () => {
    const source = "images/dl_back.jpeg";
    const resultImage = await BrowserPDF417Reader.decodeBarcode(source);

    const result = await BrowserPDF417Reader.decodeFromImageElement(
      resultImage
    );

    setDecoded(result.text);
  };

  const handleOnClick = (screenShot) => {
    setImageSrc(screenShot);
  };

  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      let image = new Image();

      image.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        doOCR();
      };

      image.src = imageSrc;

      // decodeBarcode(image);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

  return (
    <div>
      <Webcam audio={false} height={720}>
        {({ getScreenshot }) => (
          <button onClick={() => handleOnClick(getScreenshot())}>
            Capture photo
          </button>
        )}
      </Webcam>
      <canvas ref={canvasRef} id="canvas-image" width={720} height={480} />
      <p>{ocr}</p>
      <hr />
      <p>{decoded}</p>
    </div>
  );
};
