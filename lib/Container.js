'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var Image = require('./Image');
var classNames = require('./utils/classNames');

module.exports = React.createClass({
  displayName: 'Container',
  propTypes: {
    selectedImage: React.PropTypes.number,
    images: React.PropTypes.array.isRequired,
    toggleLightbox: React.PropTypes.func.isRequired,
    showImageModifiers: React.PropTypes.bool,
    renderDescriptionFunc: React.PropTypes.func
  },
  getDefaultProps: function getDefaultProps() {
    return {
      selectedImage: 0,
      renderDescriptionFunc: function renderDescriptionFunc(image) {
        return React.createElement(
          'div',
          null,
          image.description
        );
      }
    };
  },
  getInitialState: function getInitialState() {
    return {
      selectedImageIndex: this.props.selectedImage
    };
  },
  componentWillMount: function componentWillMount() {
    var scrollTop = document.body.scrollTop;
    classNames.add(document.documentElement, 'lightbox-open');
    document.documentElement.style.top = '-' + scrollTop + 'px';
    document.body.scroll = "no"; // ie only
  },
  componentWillUnmount: function componentWillUnmount() {
    var scrollTop = Math.abs(parseInt(document.documentElement.style.top));
    classNames.remove(document.documentElement, 'lightbox-open');
    document.documentElement.style.top = null;
    document.body.scrollTop = scrollTop;
    document.body.scroll = "yes"; // ie only
  },
  handleLeftClick: function handleLeftClick() {
    if (this.canMoveToLeft()) {
      this.setState({
        selectedImageIndex: this.state.selectedImageIndex - 1
      });
    };
  },
  handleRightClick: function handleRightClick() {
    if (this.canMoveToRight()) {
      this.setState({
        selectedImageIndex: this.state.selectedImageIndex + 1
      });
    };
  },
  canMoveToLeft: function canMoveToLeft() {
    return this.state.selectedImageIndex > 0;
  },
  canMoveToRight: function canMoveToRight() {
    return this.state.selectedImageIndex < this.props.images.length - 1;
  },
  toggleControls: function toggleControls() {
    classNames.toggle(this.refs.container, 'hide-controls');
  },
  render: function render() {
    var _ref = [this.props, this.state],
        props = _ref[0],
        state = _ref[1];

    var image = props.images[state.selectedImageIndex];
    var leftButton = void 0,
        rightButton = void 0;
    var description = props.renderDescriptionFunc.call(this, image);

    if (this.canMoveToLeft()) leftButton = React.createElement(
      'div',
      { className: 'lightbox-btn-left' },
      React.createElement(
        'button',
        { className: 'lightbox-btn', onClick: this.handleLeftClick },
        React.createElement('i', { className: 'fa fa-3x fa-chevron-left' })
      )
    );
    if (this.canMoveToRight()) rightButton = React.createElement(
      'div',
      { className: 'lightbox-btn-right' },
      React.createElement(
        'button',
        { className: 'lightbox-btn', onClick: this.handleRightClick },
        React.createElement('i', { className: 'fa fa-3x fa-chevron-right' })
      )
    );
    return React.createElement(
      'div',
      { className: 'lightbox-backdrop', ref: 'container' },
      React.createElement(
        'div',
        { className: 'lightbox-btn-close' },
        React.createElement(
          'button',
          { className: 'lightbox-btn', onClick: props.toggleLightbox },
          React.createElement('i', { className: 'fa fa-lg fa-times' })
        )
      ),
      React.createElement(
        'div',
        { className: 'lightbox-title-content' },
        React.createElement(
          'div',
          { className: 'lightbox-title' },
          image.title
        ),
        React.createElement(
          'div',
          { className: 'lightbox-description' },
          description
        )
      ),
      React.createElement(Image, { src: image.src, showImageModifiers: props.showImageModifiers,
        toggleControls: this.toggleControls }),
      leftButton,
      rightButton
    );
  }
});