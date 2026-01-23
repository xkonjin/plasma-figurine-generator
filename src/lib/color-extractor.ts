import sharp from 'sharp';

/**
 * Extract dominant colors from a brand logo image
 * Returns primary and complementary colors for outfit styling
 */
export async function extractBrandColors(imageBase64: string): Promise<{
  primary: string;
  secondary: string;
  description: string;
}> {
  try {
    // Convert base64 to Buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Resize image to small size for faster processing
    const resized = await sharp(buffer)
      .resize(100, 100, { fit: 'inside' })
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Extract dominant color by analyzing pixel data
    const { data, info } = resized;
    const pixelCount = info.width * info.height;
    const colorCounts: Record<string, number> = {};
    
    // Sample every 4th pixel to speed up processing
    for (let i = 0; i < data.length; i += 12) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Skip very dark or very light pixels (likely background)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      if (brightness < 20 || brightness > 235) continue;
      
      // Round to nearest 16 to group similar colors
      const rRounded = Math.round(r / 16) * 16;
      const gRounded = Math.round(g / 16) * 16;
      const bRounded = Math.round(b / 16) * 16;
      
      const colorKey = `${rRounded},${gRounded},${bRounded}`;
      colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
    }
    
    // Find most common color
    let maxCount = 0;
    let dominantColor = '44,62,80'; // Default slate blue
    
    for (const [color, count] of Object.entries(colorCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantColor = color;
      }
    }
    
    const [r, g, b] = dominantColor.split(',').map(Number);
    const primary = rgbToHex(r, g, b);
    
    // Generate a complementary secondary color (slightly lighter/darker)
    const secondary = rgbToHex(
      Math.min(255, r + 20),
      Math.min(255, g + 20),
      Math.min(255, b + 20)
    );
    
    // Generate color description for AI prompt
    const description = getColorDescription([r, g, b]);
    
    return {
      primary,
      secondary,
      description
    };
  } catch (error) {
    console.error('Color extraction error:', error);
    // Fallback to default
    return {
      primary: '#2C3E50',
      secondary: '#34495E',
      description: 'professional slate blue'
    };
  }
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Generate a human-readable color description for AI prompts
 */
function getColorDescription(rgb: [number, number, number]): string {
  const [r, g, b] = rgb;
  
  // Calculate brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const isDark = brightness < 128;
  
  // Determine dominant color channel
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  
  // Low saturation = grayscale
  if (saturation < 0.2) {
    if (brightness < 50) return 'deep charcoal';
    if (brightness < 100) return 'dark gray';
    if (brightness < 150) return 'medium gray';
    if (brightness < 200) return 'light gray';
    return 'off-white';
  }
  
  // Determine hue
  let hue = 0;
  if (max === r) {
    hue = ((g - b) / (max - min)) % 6;
  } else if (max === g) {
    hue = (b - r) / (max - min) + 2;
  } else {
    hue = (r - g) / (max - min) + 4;
  }
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  
  // Map hue to color name
  const prefix = isDark ? 'deep ' : saturation > 0.6 ? 'vibrant ' : '';
  
  if (hue < 30) return `${prefix}red`;
  if (hue < 60) return `${prefix}orange`;
  if (hue < 90) return `${prefix}yellow`;
  if (hue < 150) return `${prefix}green`;
  if (hue < 210) return `${prefix}cyan`;
  if (hue < 270) return `${prefix}blue`;
  if (hue < 330) return `${prefix}purple`;
  return `${prefix}red`;
}
