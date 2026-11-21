import { Composition } from "remotion";
import exemplo from "../public/o-vigia/tempos.json";
import { Historia, type Dados } from "./Historia";

const FPS = 30;

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Historia"
    component={Historia}
    fps={FPS}
    width={1080}
    height={1920}
    durationInFrames={300}
    defaultProps={exemplo as Dados}
    calculateMetadata={({ props }) => ({
      durationInFrames: Math.ceil((props.duracaoMs / 1000) * FPS),
    })}
  />
);
