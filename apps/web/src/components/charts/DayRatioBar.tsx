import { Log } from '../../utils/PaceUtil';

export const DayRatioBar = ({ logs }: { logs: Log[] }) => {
  const isEmpty = !logs || logs.length < 2;
  const totalDuration = !isEmpty
    ? logs[logs.length - 1].offset - logs[0].offset
    : 0;

  if (isEmpty || totalDuration <= 0) {
    return (
      <div className="flex h-2 w-full min-w-0 overflow-hidden rounded-full bg-slate-100" />
    );
  }

  // Merge consecutive intervals with the same direction
  const blocks: { type: string; duration: number }[] = [];
  let currentType = logs[1].direction;
  let currentStart = logs[0].offset;

  for (let i = 2; i < logs.length; i++) {
    const type = logs[i].direction;
    if (type !== currentType) {
      blocks.push({
        type: currentType,
        duration: logs[i - 1].offset - currentStart,
      });
      currentStart = logs[i - 1].offset;
      currentType = type;
    }
  }
  // Add the last block
  blocks.push({
    type: currentType,
    duration: logs[logs.length - 1].offset - currentStart,
  });

  return (
    <div
      className="isolate flex h-2 w-full min-w-0 transform-gpu flex-nowrap overflow-hidden rounded-full bg-slate-100"
      style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
    >
      {blocks.map((block, idx) => (
        <div
          key={idx}
          className={`transition-[width] duration-500 ease-in-out ${
            block.type === 'productive' ? 'bg-cyan-500' : 'bg-orange-400'
          }`}
          style={{ width: `${(block.duration / totalDuration) * 100}%` }}
          title={`${block.type === 'productive' ? '생산' : '소비'}: ${block.duration}분`}
        />
      ))}
    </div>
  );
};
