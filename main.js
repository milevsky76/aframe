import './style.css'
import GUI from 'lil-gui';

const activationPlane = document.getElementById('activationPlane');
const loadedModel = document.getElementById('loadedModel');
let isSlide = false;

setupGui();

function setupGui() {
  const gui = new GUI();
  const sphere = document.getElementById('metalSphere');
  const params = {
    rotate: false,
    music: false,
    levitate: false,
    slip: false
  };

  gui.add(params, 'rotate').name('Rotate Model').onChange((value) => {
    if (value) {
      loadedModel.setAttribute('item-rotate', '');
    } else {
      loadedModel.removeAttribute('item-rotate');
    }
  });

  gui.add(params, 'music').name('Play Background Music').onChange((value) => {
    if (value) {
      sphere.setAttribute('bg-music', '');
    } else {
      sphere.removeAttribute('bg-music');
    }
  });

  gui.add(params, 'levitate').name('Levitate').onChange((value) => {
    if (value) {
      loadedModel.setAttribute('levitate', '');
    } else {
      loadedModel.removeAttribute('levitate');
    }
  });

  gui.add(params, 'slip').name('Slide').onChange((value) => {
    isSlide = value;
  });
}

activationPlane.addEventListener('click', function (event) {
  let intersection = event.detail.intersection.point;

  if (!isSlide) {
    loadedModel.setAttribute('position', intersection);
    loadedModel.setAttribute('visible', true);
  } else {
    TweenMax.to(loadedModel.object3D.position, 1, {
      x: intersection.x,
      y: intersection.y,
      z: intersection.z,
      ease: Power1.easeInOut,
      onComplete: () => {
        TweenMax.killTweensOf(loadedModel.object3D.position);
      }
    });
  }
});

AFRAME.registerComponent('levitate', {
  init: function () {
    this.initialPosition = new THREE.Vector3();
    this.initialPosition.copy(this.el.object3D.position);
    this.startLevitation();
  },
  remove: function () {
    this.stopLevitation();
  },
  startLevitation() {
    TweenMax.to(this.el.object3D.position, 1, {
      y: '+=1',
      yoyo: true,
      repeat: -1,
      ease: Power1.easeInOut
    });
  },
  stopLevitation() {
    TweenMax.to(this.el.object3D.position, 1, {
      x: this.initialPosition.x,
      y: this.initialPosition.y,
      z: this.initialPosition.z,
      ease: Power1.easeInOut,
      onComplete: () => {
        TweenMax.killTweensOf(this.el.object3D.position);
      }
    });
  }
});

AFRAME.registerComponent('bg-music', {
  init: function () {
    this.audio = document.getElementById('background-music');

    if (!this.audio) {
      console.error('Audio not found');

      return;
    }

    this.audio.play();
  },
  remove: function () {
    if (this.audio) {
      this.audio.pause();
    }
  }
});

AFRAME.registerComponent('item-rotate', {
  init: function () {
    this.camera = document.querySelector('a-camera');
    this.isMouseDown = false;
    this.lastMouseX = 0;

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    this.el.addEventListener('mousedown', this.onMouseDown);
    this.el.addEventListener('touchstart', this.onMouseDown);
    this.el.addEventListener('mouseup', this.onMouseUp);
    this.el.addEventListener('touchend', this.onMouseUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('touchmove', this.onMouseMove);
  },
  remove: function () {
    this.el.removeEventListener('mousedown', this.onMouseDown);
    this.el.removeEventListener('touchstart', this.onMouseDown);
    this.el.removeEventListener('mouseup', this.onMouseUp);
    this.el.removeEventListener('touchend', this.onMouseUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('touchmove', this.onMouseMove);
  },
  onMouseDown: function (event) {
    this.isMouseDown = true;
    this.lastMouseX = event.detail.touchEvent?.changedTouches[0].clientX
    ?? event.detail.mouseEvent?.clientX;
    this.camera.removeAttribute('look-controls');
    this.camera.removeAttribute('wasd-controls');
  },
  onMouseUp: function () {
    this.isMouseDown = false;
    this.camera.setAttribute('look-controls', '');
    this.camera.setAttribute('wasd-controls', '');
  },
  onMouseMove: function (event) {
    if (this.isMouseDown) {
      let currentMouseX = event.clientX || event.touches[0].clientX;
      let deltaX = currentMouseX - this.lastMouseX;
      let rotation = this.el.getAttribute('rotation');

      rotation.y += deltaX * 0.5;

      this.el.setAttribute('rotation', rotation);
      this.lastMouseX = currentMouseX;
    }
  }
});