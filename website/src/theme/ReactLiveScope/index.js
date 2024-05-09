import { UnderlineAction, render } from '../../../../dist/index.js'
import React from 'react';
import './index.css'

const ReactLiveScope = {
  React,
  ...React,
  UnderlineAction,
  render
};

export default ReactLiveScope;