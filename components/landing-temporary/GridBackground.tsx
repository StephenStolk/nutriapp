import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type GridSize =
  | '4:4'
  | '5:5'
  | '6:6'
  | '6:8'
  | '8:8'
  | '8:12'
  | '10:10'
  | '12:8'
  | '12:12'
  | '12:16'
  | '16:16'
  | '16:12'
  | '20:20'
  | '24:16'
  | '24:24';

type GridBackgroundProps = HTMLMotionProps<'div'> & {
  children?: React.ReactNode;
  gridSize?: GridSize;
  colors?: {
    background?: string;
    borderColor?: string;
    borderSize?: string;
    borderStyle?: 'solid' | 'dashed' | 'dotted';
  };
  beams?: {
    count?: number;
    colors?: string[];
    shadow?: string;
    speed?: number;
  };
};

function GridBackground({
  className,
  children,
  gridSize = '12:8',
  colors = {},
  beams = {},
  ...props
}: GridBackgroundProps) {
  const {
    background = 'bg-background',
    borderColor = 'border-primary/10',
    borderSize = '1px',
    borderStyle = 'solid',
  } = colors;

  const {
    count = 16,
    colors: beamColors = ['bg-gray-700/80'], // light black / grayish beams
    shadow = '',
    speed = 6,
  } = beams;

  const [cols, rows] = gridSize.split(':').map(Number);

  // Generate beams aligned exactly to grid lines
  const animatedBeams = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
      const lineIndex =
        direction === 'horizontal'
          ? Math.floor(Math.random() * (rows + 1)) // horizontal lines (y-axis)
          : Math.floor(Math.random() * (cols + 1)); // vertical lines (x-axis)

      return {
        id: i,
        color: beamColors[i % beamColors.length],
        direction,
        lineIndex,
        startPosition: Math.random() > 0.5 ? 'start' : 'end',
        delay: Math.random() * 2,
        duration: speed + Math.random() * 1.5,
      };
    });
  }, [count, beamColors, speed, cols, rows]);

  const gridStyle = {
    '--border-style': borderStyle,
  } as React.CSSProperties;

  return (
    <motion.div
  className={cn('relative w-full h-full overflow-hidden', background, className)}
  style={{ ...gridStyle, isolation: "isolate" }}
  {...props}
>
      {/* Moving Grid + Beams container */}
      <motion.div
        className={cn('absolute inset-0 w-full h-full', borderColor)}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          borderRightWidth: borderSize,
          borderBottomWidth: borderSize,
          borderRightStyle: borderStyle,
          borderBottomStyle: borderStyle,
        }}
        animate={{
          x: ['0%', '1%', '0%'],
          y: ['0%', '1%', '0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {/* Grid cells */}
        {Array.from({ length: cols * rows }).map((_, index) => (
          <div
            key={index}
            className={cn('relative', borderColor)}
            style={{
              borderTopWidth: borderSize,
              borderLeftWidth: borderSize,
              borderTopStyle: borderStyle,
              borderLeftStyle: borderStyle,
            }}
          />
        ))}

        {/* Beams inside the moving grid */}
        {animatedBeams.map((beam) => (
          <motion.div
            key={beam.id}
            className={cn(
              'absolute z-20',
              beam.color,
              beam.direction === 'horizontal' ? 'w-[200%] h-[1px]' : 'h-[200%] w-[1px]',
              shadow
            )}
            style={{
              ...(beam.direction === 'horizontal'
                ? {
                    top: `${(beam.lineIndex / rows) * 100}%`,
                    left: beam.startPosition === 'start' ? '-50%' : '100%',
                    transform: 'translateY(-50%)',
                  }
                : {
                    left: `${(beam.lineIndex / cols) * 100}%`,
                    top: beam.startPosition === 'start' ? '-50%' : '100%',
                    transform: 'translateX(-50%)',
                  }),
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              ...(beam.direction === 'horizontal'
                ? {
                    x:
                      beam.startPosition === 'start'
                        ? ['0%', '100%']
                        : ['0%', '-100%'],
                  }
                : {
                    y:
                      beam.startPosition === 'start'
                        ? ['0%', '100%']
                        : ['0%', '-100%'],
                  }),
            }}
            transition={{
              duration: beam.duration,
              delay: beam.delay,
              repeat: Infinity,
              repeatDelay: Math.random() * 3 + 2,
              ease: 'linear',
              times: [0, 0.8, 0.9, 1],
            }}
          />
        ))}
      </motion.div>

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </motion.div>
  );
}

export { GridBackground, type GridBackgroundProps };
