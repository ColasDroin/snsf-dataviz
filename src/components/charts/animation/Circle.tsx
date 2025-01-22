import { useSpring, animated } from "@react-spring/web";

type CircleProps = {
  fill: string;
  r: number;
  cx: number;
  cy: number;
};

export const Circle = (props: CircleProps) => {
  const { cx, cy, r, fill } = props;

  const springProps = useSpring({
    to: { cx, cy, r },
    config: {
      friction: 30,
    },
    delay: 0,
  });

  return (
    <animated.circle
      cx={springProps.cx}
      cy={springProps.cy}
      r={springProps.r}
      //opacity={0.7}
      //stroke={color}
      fill={fill}
      //fillOpacity={0.3}
      //strokeWidth={1}
    />
  );
};
