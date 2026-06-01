import { Composition } from 'remotion';
import { strikepanePromo } from './Video';

export const RemotionRoot = () => {
  return (
    <Composition
      id="strikepanePromo"
      component={strikepanePromo}
      durationInFrames={1800}
      fps={30}
      width={1270}
      height={760}
    />
  );
};
