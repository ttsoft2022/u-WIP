import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface CheckIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const CheckIcon: React.FC<CheckIconProps> = ({
  size = 24,
  color = '#007AFF',
  strokeWidth = 2,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 12.75l6 6 9-13.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default CheckIcon;
