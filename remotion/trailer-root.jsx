import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Trailer } from './Trailer';

const Root = () => (
  <Composition
    id="Trailer"
    component={Trailer}
    durationInFrames={1350}
    fps={30}
    width={1080}
    height={1920}
  />
);

registerRoot(Root);
