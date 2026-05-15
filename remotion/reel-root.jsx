import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Reel } from './Reel';

const Root = () => (
  <Composition
    id="Reel"
    component={Reel}
    durationInFrames={750}
    fps={30}
    width={1080}
    height={1920}
  />
);

registerRoot(Root);
