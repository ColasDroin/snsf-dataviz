// -------------------------------------------------------------------------------------------------
// Imports
// -------------------------------------------------------------------------------------------------
import { useSpring, animated } from "@react-spring/web";

// -------------------------------------------------------------------------------------------------
// Type definitions
// -------------------------------------------------------------------------------------------------
type CircleProps = {
  fill: string;
  r: number;
  cx: number;
  cy: number;
  delay?: number;
};

// -------------------------------------------------------------------------------------------------
// Component
// -------------------------------------------------------------------------------------------------
export const Circle = (props: CircleProps) => {
  const { cx, cy, r, fill, delay = 0 } = props;

  const springProps = useSpring({
    // to: { cx, cy, r, fill },
    to: { transform: `translate(${cx}px, ${cy}px) scale(1)`, r },

    config: {
      friction: 50,
    },
    delay: delay,
  });

  return (
    <animated.circle
      cx={springProps.cx}
      cy={springProps.cy}
      r={r}
      //opacity={0.7}
      //stroke={color}
      fill={fill}
      //fillOpacity={0.3}
      //strokeWidth={1}
      style={{
        transform: springProps.transform,
      }}
    />
  );
};
