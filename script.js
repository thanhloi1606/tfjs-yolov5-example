let video = document.getElementById('webcam');
let text = document.getElementById("text");
let model;
const names = ['Đeo', 'Đeo sai', 'Không đeo']

const setupCamera = () => {
  navigator.mediaDevices.getUserMedia(
    {
      video: { width: 640, height: 480 },
      audio: false,
    }
  ).then((stream) => {
    video.srcObject = stream;

  });
};


detectMask = async (model) => {
  tf.engine().startScope();

  const input = tf.tidy(() => {
    return tf.image.resizeBilinear(tf.browser.fromPixels(video), [640, 640])
      .div(255.0).expandDims(0);
  });

  console.log("Execute model")
  model.executeAsync(input).then(res => {

    const [boxes, scores, classes, valid_detections] = res;
    const boxes_data = boxes.dataSync();
    const scores_data = scores.dataSync();
    const classes_data = classes.dataSync();
    const valid_detections_data = valid_detections.dataSync()[0];

    console.log("valid_detections_data: ", valid_detections_data)

    tf.dispose(res)

    for (var i = 0; i < valid_detections_data; ++i)
      text.innerHTML = names[classes_data[i]];
    // requestAnimationFrame(() => {
    //   this.detectMask(model);
    // });

    tf.engine().endScope();


  })


}

setupCamera();
video.addEventListener("loadeddata", async () => {
  console.log('Loading model')
  model = await tf.loadGraphModel("https://raw.githubusercontent.com/Rimosolia/Mask-face-js/master/model.json");
  console.log("Load finished")

  setInterval(() => {
    detectMask(model);
  }, 3000);
});

