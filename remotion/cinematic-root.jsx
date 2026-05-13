import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { CinematicAd } from './CinematicAd';

const Root = () => (
  <Composition
    id="CinematicAd"
    component={CinematicAd}
    durationInFrames={1800}
    fps={30}
    width={1080}
    height={1920}
  />
);

registerRoot(Root);
