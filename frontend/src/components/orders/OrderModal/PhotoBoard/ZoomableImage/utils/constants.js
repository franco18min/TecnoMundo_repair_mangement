// Constantes para ZoomableImage

// Colores predefinidos para marcadores y dibujos
export const COLORS = [
  '#ff0000', '#00ff00', '#0000ff', '#ffff00',
  '#ff00ff', '#00ffff', '#ffa500', '#800080',
  '#000000', '#ffffff', '#808080', '#ff69b4',
  '#32cd32', '#87ceeb', '#dda0dd', '#f0e68c'
];

// Configuración de zoom
export const ZOOM_CONFIG = {
  MIN_ZOOM: 1,
  MAX_ZOOM: 6,
  ZOOM_STEP: 0.3,
  DEFAULT_ZOOM: 1
};

// Configuración de pan (desplazamiento)
export const PAN_CONFIG = {
  MIN_PAN: -50,
  MAX_PAN: 50,
  DEFAULT_PAN: { x: 0, y: 0 }
};

// Configuración de marcadores
export const MARKER_CONFIG = {
  MIN_SIZE: 16,
  MAX_SIZE: 32,
  DEFAULT_SIZE: 20,
  DEFAULT_COLOR: '#ff0000'
};

// Configuración de dibujos
export const DRAWING_CONFIG = {
  DEFAULT_STROKE_WIDTH: 2,
  DEFAULT_COLOR: '#ff0000',
  MIN_POINTS_FOR_PATH: 2
};

// Configuración de precisión de coordenadas
export const COORDINATE_CONFIG = {
  PRECISION_MULTIPLIER: 1000000,
  PRECISION_DIVISOR: 10000
};

// Cursores personalizados
export const CUSTOM_CURSORS = {
  DEFAULT: 'default',
  CROSSHAIR: 'crosshair',
  GRAB: 'grab',
  GRABBING: 'grabbing',
  PENCIL: 'url("data:image/svg+xml;charset=utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 20 20\'%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'2\' fill=\'%23000\'/%3E%3C/svg%3E") 10 10, crosshair'
};