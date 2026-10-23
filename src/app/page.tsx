import { GameCabinet } from '@/components/game/GameCabinet';
import { ControlsLegend } from '@/components/game/ControlsLegend';

export default function HomePage() {
  return (
    <main>
      <GameCabinet legend={<ControlsLegend />} />
    </main>
  );
}
