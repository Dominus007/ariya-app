import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { haptics } from '../lib/haptics';
import { useModeStore } from '../store/useModeStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { PlaybackMode } from '../types/content';

const OPTIONS: { label: string; value: PlaybackMode; icon: string }[] = [
  { label: 'Listen', value: 'listen', icon: '🎧' },
  { label: 'Watch', value: 'watch', icon: '📺' },
];

/**
 * App-wide segmented control that switches Home/Search/Library between audio
 * and video content. Floats over the whole tab navigator (see
 * TabNavigator), so it stays put through scroll.
 */
export function ModeToggle() {
  const mode = useModeStore((state) => state.mode);
  const setMode = useModeStore((state) => state.setMode);

  return (
    <View style={styles.track}>
      {OPTIONS.map((option) => (
        <ToggleSegment
          key={option.value}
          icon={option.icon}
          label={option.label}
          active={option.value === mode}
          onPress={() => {
            if (option.value !== mode) haptics.select();
            setMode(option.value);
          }}
        />
      ))}
    </View>
  );
}

function ToggleSegment({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  // Color/background interpolation needs the JS driver, not the native one.
  const progress = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: active ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [active, progress]);

  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', colors.gold],
  });
  const textColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textMuted, colors.background],
  });

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.segment, { backgroundColor }]}>
        <Text style={styles.icon}>{icon}</Text>
        <Animated.Text style={[styles.label, { color: textColor }]}>{label}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.cardActive,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 100,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
});
