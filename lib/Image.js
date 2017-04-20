'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var ImageModifiers = require('./ImageModifiers');
var classNames = require('./utils/classNames');
var ZOOM_STEP = 1.10;
var _ref = [Math.pow(ZOOM_STEP, 30), Math.pow(1 / ZOOM_STEP, 10)],
    MAX_ZOOM_SIZE = _ref[0],
    MIN_ZOOM_SIZE = _ref[1];


module.exports = React.createClass({
  displayName: 'Image',
  propTypes: {
    src: React.PropTypes.string.isRequired,
    showImageModifiers: React.PropTypes.bool.isRequired
  },
  getInitialState: function getInitialState() {
    return {
      loader: true,
      ratio: 1,
      positionX: 0,
      positionY: 0,
      rotate: 0,
      width: 0,
      height: 0,
      boxWidth: 0,
      boxHeight: 0
    };
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.resetImageInitialState(nextProps);
  },
  componentDidMount: function componentDidMount() {
    this.resetImageInitialState(this.props);
    this.startPoints = null;
    window.addEventListener('resize', this.handleWindowResize);
    document.addEventListener('mousedown', this.handleMoveStart);
    document.addEventListener('mouseup', this.handleMoveEnd);
    document.addEventListener('touchstart', this.handleMoveStart);
    document.addEventListener('touchend', this.handleMoveEnd);
    window.setTimeout(this.props.toggleControls, 500);
    if (this.props.showImageModifiers) {
      document.addEventListener('mousemove', this.handleMove);
      document.addEventListener('touchmove', this.handleMove);
      document.addEventListener('wheel', this.handleWheel);
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
    document.removeEventListener('mousedown', this.handleMoveStart);
    document.removeEventListener('mousemove', this.handleMove);
    document.removeEventListener('mouseup', this.handleMoveEnd);
    document.removeEventListener('touchstart', this.handleMoveStart);
    document.removeEventListener('touchmove', this.handleMove);
    document.removeEventListener('touchend', this.handleMoveEnd);
    document.removeEventListener('wheel', this.handleWheel);
  },
  resetImageInitialState: function resetImageInitialState(props) {
    var img = new Image();
    var _this = this;
    img.onload = function () {
      var _ref2 = [this.width, this.height],
          width = _ref2[0],
          height = _ref2[1];

      var box = ReactDOM.findDOMNode(_this.refs.container);
      var _ref3 = [box.offsetWidth, box.offsetHeight],
          boxWidth = _ref3[0],
          boxHeight = _ref3[1];

      var ratio = Math.min(boxWidth / width, boxHeight / height);
      _this.setState({
        loader: false,
        ratio: ratio,
        rotate: 0,
        positionX: (boxWidth - width * ratio) / 2,
        positionY: (boxHeight - height * ratio) / 2,
        width: this.width,
        height: this.height,
        boxWidth: boxWidth,
        boxHeight: boxHeight,
        moving: false
      });
    };
    img.src = props.src;
  },
  handleWindowResize: function handleWindowResize() {
    this.resetImageInitialState(this.props);
  },
  handleRotate: function handleRotate(angle) {
    this.setState({
      rotate: (360 + this.state.rotate + angle) % 360
    });
  },
  handleZoom: function handleZoom(direction) {
    var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    var percent = direction > 0 ? Math.pow(ZOOM_STEP, scale) : Math.pow(1 / ZOOM_STEP, scale);
    var ratio = this.setZoomLimits(this.state.ratio * percent);
    var state = this.state;
    var delta = 0.05;
    var newPositionX = void 0,
        newPositionY = void 0;

    if (Math.min(state.boxWidth / state.width, state.boxHeight / state.height) >= ratio - delta) {
      newPositionX = (state.boxWidth - state.width * ratio) / 2;
      newPositionY = (state.boxHeight - state.height * ratio) / 2;
    } else {
      // Center image from container's center
      var offsetX = state.boxWidth / 2;
      var offsetY = state.boxHeight / 2;

      var bgCursorX = offsetX - state.positionX;
      var bgCursorY = offsetY - state.positionY;

      var bgRatioX = bgCursorX / (state.width * state.ratio);
      var bgRatioY = bgCursorY / (state.height * state.ratio);

      newPositionX = offsetX - state.width * ratio * bgRatioX;
      newPositionY = offsetY - state.height * ratio * bgRatioY;
    }

    this.setState({
      ratio: ratio,
      positionX: newPositionX,
      positionY: newPositionY
    });
  },
  setZoomLimits: function setZoomLimits(size) {
    var state = this.state;
    var originalRatio = Math.min(state.boxWidth / state.width, state.boxHeight / state.height);
    if (size / originalRatio > MAX_ZOOM_SIZE) return MAX_ZOOM_SIZE * originalRatio;else if (size / originalRatio < MIN_ZOOM_SIZE) return MIN_ZOOM_SIZE * originalRatio;else return size;
  },
  handleWheel: function handleWheel(ev) {
    if (this.isInsideImage(ev)) this.handleZoom(ev.deltaY);
  },
  handleMove: function handleMove(ev) {
    ev = this.getEv(ev);
    var state = this.state;
    if (!state.moving) return;
    var posX = void 0,
        posY = void 0;
    switch (state.rotate) {
      case 90:
        posY = this.startPoints[0] - ev.pageX;
        posX = ev.pageY - this.startPoints[1];
        break;
      case 180:
        posX = this.startPoints[0] - ev.pageX;
        posY = this.startPoints[1] - ev.pageY;
        break;
      case 270:
        posY = ev.pageX - this.startPoints[0];
        posX = this.startPoints[1] - ev.pageY;
        break;
      default:
        posX = ev.pageX - this.startPoints[0];
        posY = ev.pageY - this.startPoints[1];
    }
    this.startPoints = [ev.pageX, ev.pageY];

    if (state.positionX + posX >= 0 || state.positionX + posX <= state.boxWidth - state.width * state.ratio) posX = 0;
    if (state.positionY + posY >= 0 || state.positionY + posY <= state.boxHeight - state.height * state.ratio) posY = 0;

    this.setState({
      positionX: state.positionX + posX,
      positionY: state.positionY + posY
    });
  },
  handleMoveEnd: function handleMoveEnd(ev) {
    this.setState({
      moving: false
    });
  },
  handleMoveStart: function handleMoveStart(ev) {
    ev = this.getEv(ev);
    if (!this.isInsideImage(ev) || ev.which != 1) return;
    this.startPoints = [ev.pageX, ev.pageY];
    this.setState({
      moving: true
    });
    var _this = this;

    // check if touch was a tap
    window.setTimeout(function () {
      if (!_this.state.moving && _this.startPoints && _this.startPoints[0] === ev.pageX && _this.startPoints[1] === ev.pageY && classNames.contains(ev.target, ['lightbox-backdrop', 'lightbox-image'])) {
        _this.props.toggleControls();
      }
    }, 200);
  },
  isInsideImage: function isInsideImage(ev) {
    var rect = ReactDOM.findDOMNode(this.refs.container).getBoundingClientRect();
    if (ev.pageY < rect.top || ev.pageY > rect.bottom || ev.pageX < rect.left || ev.pageX > rect.right) return false;
    return true;
  },
  getEv: function getEv(ev) {
    if (ev.type === 'touchstart' || ev.type === 'touchmove' || ev.type === 'touchend') return { pageX: ev.touches[0].pageX, pageY: ev.touches[0].pageY, which: 1, target: ev.target };
    return ev;
  },
  render: function render() {
    var _ref4 = [this.props, this.state],
        props = _ref4[0],
        state = _ref4[1];

    var background = 'url(' + props.src + ')';
    var modifiers = void 0,
        loader = void 0;
    if (props.showImageModifiers) {
      modifiers = React.createElement(ImageModifiers, {
        handleRotate: this.handleRotate,
        handleZoom: this.handleZoom,
        currentImage: props.src });
    }
    if (state.loader) {
      background = 'none';
      loader = React.createElement(
        'div',
        { className: 'lightbox-loader' },
        React.createElement('i', { className: 'fa fa-3x fa-spinner fa-spin' })
      );
    }
    var transform = 'rotate(' + state.rotate + 'deg)';
    var styles = {
      height: '100%',
      backgroundImage: background,
      backgroundRepeat: 'no-repeat',
      backgroundSize: state.width * state.ratio + 'px ' + state.height * state.ratio + 'px',
      backgroundPosition: state.positionX + 'px ' + state.positionY + 'px',
      MsTransform: transform,
      WebkitTransform: transform,
      transform: transform
    };
    return React.createElement(
      'div',
      { className: 'lightbox-content-center' },
      modifiers,
      React.createElement(
        'div',
        { className: 'lightbox-image-container', ref: 'container' },
        React.createElement(
          'div',
          { className: 'lightbox-image' + (state.moving ? ' moving' : ''), style: styles },
          loader
        )
      )
    );
  }
});