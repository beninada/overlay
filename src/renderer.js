/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import { ipcRenderer } from 'electron';
import './index.css';

const TOP_ROW_SPACING = 50;
let imageElement;
let opacitySlider;

function loadFile(event) {
  if (event.target.files && event.target.files[0]) {
    const reader = new FileReader();

    reader.onload = function(e) {
      imageElement = document.getElementById('overlay-image');
      // let imageInputElement = document.getElementById('image-input');

      // Create a DOM element for the image overlay if it doesn't exist yet
      if (!imageElement) {
        imageElement = createImageElement();
        document.body.appendChild(imageElement);
      }

      imageElement.src = e.target.result;
      // imageInputElement.style.display = "none";

      // Remove any existing opacity slider
      if (opacitySlider) {
        opacitySlider.remove();
      }

      // Create an opacity slider linked to the image overlay
      opacitySlider = document.createElement('input');
      opacitySlider.type = 'range';
      opacitySlider.min = 0;
      opacitySlider.max = 100;
      opacitySlider.step = 1;
      opacitySlider.oninput = () => imageElement.style.opacity = opacitySlider.value / 100;
      opacitySlider.onchange = () => imageElement.style.opacity = opacitySlider.value / 100;
      document.getElementById('top-row').appendChild(opacitySlider);

      // Use an Image object to get the dimensions of the image so that we can
      // resize the window appropriately
      let image = new Image();
      image.src = e.target.result;

      image.onload = () => {
        ipcRenderer.send('resize-main-window', {
          height: image.height + TOP_ROW_SPACING,
          width: image.width,
        });
      }
    }
    
    // Convert the image to a base64 string
    reader.readAsDataURL(event.target.files[0]);
  }
}

function createImageElement() {
  let element = document.createElement('img');
  element.id = 'overlay-image';
  element.style["background-size"] = "cover";
  element.style["opacity"] = 0.5;
  element.style["height"] = "100%";
  element.style["width"] = "100%";
  element.style["user-drag"] = "none";
  element.style["user-select"] = "none";
  element.style["-webkit-user-drag"] = "none";
  element.style["-webkit-user-select"] = "none";
  return element;
}

function initializePage() {
  document.getElementById('image-input').onchange = (event) => loadFile(event);
}

initializePage();
