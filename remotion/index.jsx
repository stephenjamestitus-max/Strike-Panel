import React from 'react';
import { Composition } from 'remotion';
import { registerRoot } from 'remotion';
import { MorningBrief } from './MorningBrief';

const Root = () => (
  <Composition
    id="MorningBrief"
    component={MorningBrief}
    durationInFrames={150}
    fps={30}
    width={1080}
    height={1080}
  />
);

registerRoot(Root);
