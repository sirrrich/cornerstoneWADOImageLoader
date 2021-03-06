cornerstoneWADOImageLoader = {};

(function () {

  // flag to ensure codecs are loaded only once
  var codecsLoaded = false;

  // the configuration object for the decodeTask
  var decodeConfig;

  /**
   * Function to control loading and initializing the codecs
   * @param config
   */
  function loadCodecs(config) {
    // prevent loading codecs more than once
    if (codecsLoaded) {
      return;
    }

    // Load the codecs
    //console.time('loadCodecs');
    self.importScripts(config.decodeTask.codecsPath);
    codecsLoaded = true;
    //console.timeEnd('loadCodecs');

    // Initialize the codecs
    if (config.decodeTask.initializeCodecsOnStartup) {
      //console.time('initializeCodecs');
      cornerstoneWADOImageLoader.initializeJPEG2000(config.decodeTask);
      cornerstoneWADOImageLoader.initializeJPEGLS(config.decodeTask);
      //console.timeEnd('initializeCodecs');
    }
  }

  /**
   * Task initialization function
   */
  function decodeTaskInitialize(config) {
    decodeConfig = config;
    if (config.decodeTask.loadCodecsOnStartup) {
      loadCodecs(config);
    }
  }

  function calculateMinMax(imageFrame) {
    if (imageFrame.smallestPixelValue !== undefined && imageFrame.largestPixelValue !== undefined) {
      return;
    }

    var minMax = cornerstoneWADOImageLoader.getMinMax(imageFrame.pixelData);
    imageFrame.smallestPixelValue = minMax.min;
    imageFrame.largestPixelValue = minMax.max;
  }

  /**
   * Task handler function
   */
  function decodeTaskHandler(data, doneCallback) {
    // Load the codecs if they aren't already loaded
    loadCodecs(decodeConfig);

    var imageFrame = data.data.imageFrame;

    // convert pixel data from ArrayBuffer to Uint8Array since web workers support passing ArrayBuffers but
    // not typed arrays
    var pixelData = new Uint8Array(data.data.pixelData);

    cornerstoneWADOImageLoader.decodeImageFrame(
      imageFrame,
      data.data.transferSyntax,
      pixelData,
      decodeConfig.decodeTask,
      data.data.options);

    calculateMinMax(imageFrame);

    // convert from TypedArray to ArrayBuffer since web workers support passing ArrayBuffers but not
    // typed arrays
    imageFrame.pixelData = imageFrame.pixelData.buffer;

    // invoke the callback with our result and pass the pixelData in the transferList to move it to
    // UI thread without making a copy
    doneCallback(imageFrame, [imageFrame.pixelData]);
  }

  // register our task
  cornerstoneWADOImageLoaderWebWorker.registerTaskHandler({
    taskType: 'decodeTask',
    handler: decodeTaskHandler,
    initialize: decodeTaskInitialize
  });
}());
