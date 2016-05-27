import React, { Component, ReactDOM } from 'react';
import _ from 'lodash';
import { ctx, getCurrentTime } from 'sine/audio';
import getCanvas from './getCanvas';


export default class BufferViewer extends Component {
  render() {
    return (
      <BufferCanvas
        buffer={this.props.buffer}
        select={this.props.select}
        width={this.props.width}
        height={this.props.height}
      />
    )
  }
}

class BufferCanvas extends Component {
  render() {
    return (<canvas
      ref='canvas'
      onTouchTap={this.handleTouchTap}
    />)
  }

  componentDidMount() {
    this.setupCanvasAndDraw();
  }

  componentDidUpdate() {
    this.setupCanvasAndDraw();
  }


  setupCanvasAndDraw() {
    this.canvasCtx = getCanvas(
      this.refs.canvas,
      this.props.width,
      this.props.height
    );

    this.props.buffer && this.draw(this.props.buffer);
  }

  handleTouchTap = (e) => {
    const clientX = this.getClientX(e.nativeEvent);
    const canvasLeft = this.getCanvasLeft();

    const x = clientX + canvasLeft;

    this.props.select(x / this.props.width);
  }

  getClientX = (nativeEvent) => {
     // Not sure why changedTouches and not touches
    const touches = nativeEvent.changedTouches;
    return touches ? touches[0].clientX : nativeEvent.clientX;
  }

  getCanvasLeft = () => {
    const body = document.body;
    const html = document.documentElement;
    return body.scrollLeft + html.scrollLeft - this.refs.canvas.offsetLeft;
  }

  draw(buffer) {
    const amplitudes = this.getAmplitudes(buffer);

    const halfHeight = this.props.height / 2;

    this.canvasCtx.clearRect(0, 0, this.props.width, this.props.height);
    this.canvasCtx.shadowColor = "rgb(66, 165, 245)";
    this.canvasCtx.shadowBlur = 3;
    this.canvasCtx.fillStyle = "#000";

    // Scale amplitudes then draw them
    amplitudes.map(amp => amp * halfHeight + 1).forEach((amp, i) => {
      if (i % 2 == 0) { // only draw even lines
        this.canvasCtx.fillRect(i, halfHeight - amp, 1, amp * 2)
      }
    });
  }

  getAmplitudes(buffer) {
    const data = [buffer.getChannelData(0), buffer.getChannelData(1)];
    const samplesPerPixel = Math.floor(buffer.length / this.props.width);

    const amplitudes = [];

    for (let i = 0; i < this.props.width; i++) {
      const sampleIndex = i * samplesPerPixel;
      const val = (data[0][sampleIndex] + data[1][sampleIndex]) / 2;
      const amplitude = Math.pow(Math.abs(val), 0.5);
      amplitudes.push(amplitude);
    }

    return this.normalizeAmplitudes(amplitudes);
  }

  normalizeAmplitudes(amplitudes) {
    const maxAmplitude = amplitudes.reduce((a, b) => (b > a) ? b : a);
    return amplitudes.map(a => a / maxAmplitude);
  }
}
