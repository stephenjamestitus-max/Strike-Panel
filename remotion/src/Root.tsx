import { Composition } from 'remotion';
import { strikepanelPromo } from './Video';

export const RemotionRoot = () => {
  return (
    <Composition
      id="strikepanelPromo"
      component={strikepanelPromo}
      durationInFrames={1800}
      fps={30}
      width={1270}
      height={760}
    />
  );
};
