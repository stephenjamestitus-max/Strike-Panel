import { Composition } from 'remotion';
import { StrikePanelPromo } from './Video';

export const RemotionRoot = () => {
  return (
    <Composition
      id="StrikePanelPromo"
      component={StrikePanelPromo}
      durationInFrames={1800}
      fps={30}
      width={1270}
      height={760}
    />
  );
};
