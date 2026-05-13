import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { TrailerMovie } from './TrailerMovie';

const Root = () => (
  <Composition
    id="TrailerMovie"
    component={TrailerMovie}
    durationInFrames={1740}
    fps={30}
    width={1080}
    height={1920}
  />
);

registerRoot(Root);
