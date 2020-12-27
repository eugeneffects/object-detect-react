import React from "react";
import ReactDOM from "react-dom";

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./styles.css";

class App extends React.Component {
  videoRef = React.createRef();
  canvasRef = React.createRef();

  componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "user"
          }
        })
        .then(stream => {
          window.stream = stream;
          this.videoRef.current.srcObject = stream;
          return new Promise((resolve, reject) => {
            this.videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        });
      const modelPromise = cocoSsd.load();
      Promise.all([modelPromise, webCamPromise])
        .then(values => {
          this.detectFrame(this.videoRef.current, values[0]);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  detectFrame = (video, model) => {
    model.detect(video).then(predictions => {
      this.renderPredictions(predictions);
      requestAnimationFrame(() => {
        this.detectFrame(video, model);
      });
    });
  };

  renderPredictions = predictions => {
    const ctx = this.canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      // Draw the bounding box.
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      // Draw the label background.
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      // Draw the text last to ensure it's on top.
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
    });
  };

  render() {
    return (
      <div>
        <video
          className="size"
          autoPlay
          playsInline
          muted
          ref={this.videoRef}
          width="600"
          height="500"
        />
        <canvas
          className="size"
          ref={this.canvasRef}
          width="600"
          height="500"
        />

<div className="intro">
      <br/>
      <h1>어떻게 구현되나요?</h1>
      <p>
        <a href="https://js.tensorflow.org" target="_blank" rel="noopener noreferrer">
        Tensorflow.js</a>, 로 웹캠에서 물체를 파악하는 딥러닝 모델을 사용합니다.
        <br/>웹캠을 통한 어떤 정보도 획득하지 않으며, 
        <br/>모든 프로세스는 당신의 컴퓨터 내에서만 이뤄집니다!
        <br/>사전 학습된 물체에 대해서만 판별 가능합니다.
        (서버살 돈이 없어요...)
      </p>
      <br/>
      <h1>제 프로젝트에서도 이런 기술을 사용할 수 있나요?</h1>
      <p>
        물론이죠! 아래 링크에서 확인해보세요.
        <br/>
        <a href="https://modeldepot.io/mikeshi/tiny-yolo-in-javascript" target="_blank" rel="noopener noreferrer">
          ModelDepot!
        </a>
      </p>
      <br/>
      <h1>이거 왜 이렇게 느립니까!?</h1>
      <p>
        실시간 물체탐지 기술은 꽤 어려운 일이고, 
        <br/>대부분의 모델은 강력한 GPU를 갖춘 컴퓨터에서 사용되도록 최적화 되어있습니다.
        <br/>아마도 GPU를 가지고 있지 않으실 것이라서,(휴대폰이라면 더욱)
        <br/>최대의 성능을 내긴 어려울 것 입니다.
      </p>
      <br/>
      <h1>작동 원리는 어떻게 되나요?</h1>
      <p>
        최신 이미지 인식 기술인
        <a href="https://pjreddie.com/darknet/yolo/" target="_blank" rel="noopener noreferrer">
        Tiny YOLO</a> 모델을 사용하고 있으며 
        <br/>웹에서 사용가능하도록 Tensorflow.js 로 변환되었습니다.
        <br/>자세한 내용은 링크에서 확인하세요.
      </p>
    </div>
  </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
