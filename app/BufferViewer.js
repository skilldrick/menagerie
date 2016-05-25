import React, { Component, ReactDOM } from 'react';
import _ from 'lodash';
import {ctx, getCurrentTime} from 'sine/audio';
import getCanvas from './getCanvas';


export default class BufferViewer extends Component {
  render() {
    return (<BufferCanvas buffer={this.props.buffer} />)
  }
}

class BufferCanvas extends Component {
  render() {
    return (<canvas ref='canvas' />)
  }

  componentDidMount() {
    this.canvasCtx = getCanvas(
      this.refs.canvas,
      this.props.width,
      this.props.height
    );
  }

  shouldComponentUpdate(props) {
    props.buffer && this.draw(props.buffer);
    return false;
  }

  draw(buffer) {
    const amplitudes = this.getAmplitudes(buffer);

    const halfHeight = this.props.height / 2;

    this.canvasCtx.clearRect(0, 0, this.props.width, this.props.height);
    this.canvasCtx.fillStyle = "#000";

    // Scale amplitudes then draw them
    amplitudes.map(amp => amp * halfHeight).forEach((amp, i) => {
      if (i % 2 == 0) { // only draw even lines
        this.canvasCtx.fillRect(i, halfHeight - amp, 1, amp * 2)
      }
    });
  }

  getAmplitudes(buffer) {
    console.log('start', getCurrentTime());

    const data = [buffer.getChannelData(0), buffer.getChannelData(1)];

    var amplitudes = [];

    const samplesPerPixel = Math.floor(buffer.length / this.props.width);

    for (let i = 0; i < this.props.width; i++) {
      const sampleIndex = i * samplesPerPixel;
      const val = (data[0][sampleIndex] + data[1][sampleIndex]) / 2;
      const amplitude = Math.pow(Math.abs(val), 0.5);
      amplitudes.push(amplitude);
    }

    console.log('end', getCurrentTime());

    return amplitudes;
  }

  //TODO: pass these in
  static defaultProps = {
    width: 450,
    height: 200
  };
}
