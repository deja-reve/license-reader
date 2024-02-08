import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { createWorker } from "tesseract.js";
import { PDF417Reader, BarcodeFormat } from "@zxing/library";

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

  const decodeBarcode = async (image) => {
    const codeReader = new PDF417Reader();

    const sourceImg = document.getElementById("dl-back");

    const hints = new Map();
    const formats = [BarcodeFormat.PDF_417];

    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);

    const reader = new MultiFormatReader();

    const luminanceSource = new RGBLuminanceSource(
      imgByteArray,
      imgWidth,
      imgHeight
    );
    const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

    const result = codeReader.decode(binaryBitmap, hints);

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

      decodeBarcode(image);
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
      <img alt="" id="dl-back" src="images/dl_back.jpeg" />
    </div>
  );
};
