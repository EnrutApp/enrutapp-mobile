import { StyleSheet, Text, View } from 'react-native';

interface AvatarProps {
  name: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

export function Avatar({ 
  name, 
  size = 50, 
  backgroundColor = '#2563eb',
  textColor = '#FFFFFF' 
}: AvatarProps) {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View 
      style={[
        styles.container, 
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2, 
          backgroundColor 
        }
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.4, color: textColor }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
  },
});
