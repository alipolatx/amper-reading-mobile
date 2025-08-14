import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface CircularProgressProps {
  percentage: number;
  totalReadings: number;
  offCount: number;
  minCount: number;
  midCount: number;
  maxCount: number;
  size?: number;
  strokeWidth?: number;
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
}

interface SegmentColors {
  off: string;
  min: string;
  mid: string;
  max: string;
}

const { width } = Dimensions.get('window');

const CircularProgress: React.FC<CircularProgressProps> = ({
  totalReadings,
  offCount,
  minCount,
  midCount,
  maxCount,
  size = Math.min(width * 0.4, 200),
  strokeWidth = 12,
  secondaryColor = '#E0E0E0',
  textColor = '#333',
}) => {
  const radius = (size - strokeWidth) / 2;

  const segmentColors: SegmentColors = {
    off: '#9E9E9E',
    min: '#FF9800',
    mid: '#2196F3',
    max: '#4CAF50',
  };

  const offPercentage =
    totalReadings > 0 ? (offCount / totalReadings) * 100 : 0;
  const minPercentage =
    totalReadings > 0 ? (minCount / totalReadings) * 100 : 0;
  const midPercentage =
    totalReadings > 0 ? (midCount / totalReadings) * 100 : 0;
  const maxPercentage =
    totalReadings > 0 ? (maxCount / totalReadings) * 100 : 0;

  const createSegmentPath = (startAngle: number, endAngle: number): string => {
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = size / 2 + radius * Math.cos(startAngleRad);
    const y1 = size / 2 + radius * Math.sin(startAngleRad);
    const x2 = size / 2 + radius * Math.cos(endAngleRad);
    const y2 = size / 2 + radius * Math.sin(endAngleRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  let currentAngle = 0;
  const segments = [
    { percentage: offPercentage, color: segmentColors.off, label: 'OFF' },
    { percentage: minPercentage, color: segmentColors.min, label: 'MIN' },
    { percentage: midPercentage, color: segmentColors.mid, label: 'MID' },
    { percentage: maxPercentage, color: segmentColors.max, label: 'MAX' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={secondaryColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Render segments */}
          {segments.map((segment, index) => {
            if (segment.percentage === 0) return null;

            const startAngle = currentAngle;
            const endAngle = currentAngle + (segment.percentage / 100) * 360;
            const segmentPath = createSegmentPath(startAngle, endAngle);

            currentAngle = endAngle;

            return (
              <Path
                key={index}
                d={segmentPath}
                stroke={segment.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeLinecap="round"
              />
            );
          })}
        </Svg>

        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={[styles.percentageText, { color: textColor }]}>
            {totalReadings}
          </Text>
          <Text style={[styles.labelText, { color: textColor }]}>
            Total Okuma
          </Text>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: segmentColors.off }]}>
            {offCount}
          </Text>
          <Text style={[styles.statPercentage, { color: segmentColors.off }]}>
            {offPercentage.toFixed(1)}%
          </Text>
          <Text style={[styles.statLabel, { color: textColor }]}>OFF</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: segmentColors.min }]}>
            {minCount}
          </Text>
          <Text style={[styles.statPercentage, { color: segmentColors.min }]}>
            {minPercentage.toFixed(1)}%
          </Text>
          <Text style={[styles.statLabel, { color: textColor }]}>MIN</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: segmentColors.mid }]}>
            {midCount}
          </Text>
          <Text style={[styles.statPercentage, { color: segmentColors.mid }]}>
            {midPercentage.toFixed(1)}%
          </Text>
          <Text style={[styles.statLabel, { color: textColor }]}>MID</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: segmentColors.max }]}>
            {maxCount}
          </Text>
          <Text style={[styles.statPercentage, { color: segmentColors.max }]}>
            {maxPercentage.toFixed(1)}%
          </Text>
          <Text style={[styles.statLabel, { color: textColor }]}>MAX</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 48,
    paddingHorizontal: 20,
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statPercentage: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
});

export default CircularProgress;
