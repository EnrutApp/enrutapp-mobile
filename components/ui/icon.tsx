import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleProp, TextStyle } from 'react-native';

interface IconProps {
  name: keyof typeof MaterialIcons.glyphMap;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function Icon({ name, size = 24, color = '#000', style }: IconProps) {
  return <MaterialIcons name={name} size={size} color={color} style={style} />;
}

// Exportar también los nombres de iconos comunes para autocompletado
export const IconNames = {
  // Navigation
  home: 'home',
  menu: 'menu',
  arrowBack: 'arrow-back',
  arrowForward: 'arrow-forward',
  chevronLeft: 'chevron-left',
  chevronRight: 'chevron-right',
  chevronUp: 'keyboard-arrow-up',
  chevronDown: 'keyboard-arrow-down',
  close: 'close',
  
  // Actions
  check: 'check',
  add: 'add',
  edit: 'edit',
  delete: 'delete',
  search: 'search',
  settings: 'settings',
  refresh: 'refresh',
  
  // Content
  person: 'person',
  people: 'people',
  place: 'place',
  directions: 'directions',
  directionsCar: 'directions-car',
  schedule: 'schedule',
  event: 'event',
  phone: 'phone',
  email: 'email',
  
  // Status
  info: 'info',
  warning: 'warning',
  error: 'error',
  checkCircle: 'check-circle',
  cancel: 'cancel',
  
  // Transport
  localShipping: 'local-shipping',
  airport: 'local-airport',
  bus: 'directions-bus',
  
  // Other
  star: 'star',
  favorite: 'favorite',
  visibility: 'visibility',
  visibilityOff: 'visibility-off',
} as const;
