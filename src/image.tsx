import satori from 'satori';
import { Resvg } from '@resvg/resvg-wasm';
import { Options } from './index';

const FONT_SIZE_DIVISOR = 20;
const BORDER_WIDTH_DIVISOR = 2;
const TEXT_SHADOW = '0 0 0.1em rgba(0, 0, 0, 0.5)';
const FONT_FAMILY_DEFAULT = 'Noto Sans JP';
const FONT_FAMILY_MONO = 'Noto Sans Mono';
const FONT_FAMILY_SERIF = 'Noto Serif JP';
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1';

function Component(options: Options) {
  const {
    borderStyle,
    background,
    fontSize,
    size,
    bold,
    rounded,
    border,
    borderWidth,
    opacity,
    color,
    rotate,
    shadow,
    fontFamily,
    blur,
    oblique,
    name,
  } = options;

  const computedBorderStyle = borderStyle === 'dashed' ? 'dashed' : 'solid';

  const containerStyle = {
    height: '100%',
    width: '100%',
    position: 'relative',
    backgroundColor: background,
    fontSize: `${(fontSize * size) / FONT_SIZE_DIVISOR}rem`,
    fontWeight: bold ? 'bold' : 'normal',
    borderRadius: rounded ? '50%' : '0',
    whiteSpace: 'nowrap',
    display: 'flex',
    border: border
      ? `${borderWidth / BORDER_WIDTH_DIVISOR}em ${computedBorderStyle} ${border}`
      : 'none',
    opacity: opacity,
  };

  const textStyle = {
    display: 'flex',
    color: color,
    fontSize: 'inherit',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
    textShadow: shadow ? TEXT_SHADOW : 'none',
    fontFamily: fontFamily === 'mono' ? FONT_FAMILY_MONO : 'inherit',
    filter: blur ? `blur(${blur / 10}em)` : 'none',
  };

  const textInnerStyle = {
    paddingBottom: '0.15em',
    ...(oblique && { transform: 'skewX(-10deg)' }),
  };

  return (
    <div style={containerStyle}>
      <div style={textStyle}>
        <span style={textInnerStyle}>{name}</span>
      </div>
    </div>
  );
}

async function fetchFont(text: string, weight: number, fontFamily: string) {
  const url = new URL('https://fonts.googleapis.com/css2');

  const fontFamilyParam =
    fontFamily === 'serif'
      ? FONT_FAMILY_SERIF
      : fontFamily === 'mono'
        ? FONT_FAMILY_MONO
        : FONT_FAMILY_DEFAULT;

  url.searchParams.append('family', `${fontFamilyParam}:wght@${weight}`);
  url.searchParams.append('text', text);

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch font');
  }

  const css = await response.text();
  const fontUrlMatch = css.match(
    /src: url\((?<fontUrl>[^)]+)\) format\(['"](?:opentype|truetype)['"]\)/u,
  );
  const fontUrl = fontUrlMatch?.groups?.fontUrl;

  if (!fontUrl) {
    throw new Error('Failed to parse font');
  }

  const fontResponse = await fetch(fontUrl);
  if (!fontResponse.ok) {
    throw new Error(`Failed to fetch font: ${fontResponse.statusText}`);
  }

  return fontResponse.arrayBuffer();
}

export default async function generateImage(
  options: Options,
): Promise<Uint8Array | string> {
  const font = await fetchFont(
    options.name,
    options.bold ? 700 : 400,
    options.fontFamily,
  );
  const fontName =
    options.fontFamily === 'mono' ? FONT_FAMILY_MONO : FONT_FAMILY_DEFAULT;

  const svg = await satori(<Component {...options} />, {
    width: options.size,
    height: options.size,
    fonts: [{ data: font, name: fontName }],
  });

  if (options.format === 'svg') {
    return svg;
  } else {
    const resvg = new Resvg(svg);
    resvg.cropByBBox(resvg.innerBBox()!);
    const image = resvg.render().asPng();
    return image;
  }
}
