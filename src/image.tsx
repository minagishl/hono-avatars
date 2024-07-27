import satori from 'satori';
import { Resvg } from '@resvg/resvg-wasm';
import { Options } from './index';

function Component(options: Options) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        backgroundColor: options.background,
        fontSize: `${(options.fontSize * options.size) / 20}rem`,
        fontWeight: options.bold ? 'bold' : 'normal',
        borderRadius: options.rounded ? '50%' : '0',
        whiteSpace: 'nowrap',
        display: 'flex',
        paddingBottom: '0.15em',
        border: options.border ? `0.1em solid ${options.border}` : 'none',
      }}
    >
      <div
        style={{
          color: options.color,
          fontSize: 'inherit',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textShadow: options.shadow ? '0 0 0.1em rgba(0, 0, 0, 0.5)' : 'none',
        }}
      >
        {options.name}
      </div>
    </div>
  );
}

async function fetchFont(text: string, weight: number) {
  const url = new URL('https://fonts.googleapis.com/css2');
  url.searchParams.append('family', `Noto Sans JP:wght@${weight}`);
  url.searchParams.append('text', text);

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch font');
  }

  const css = await response.text();

  const resource = css.match(
    /src: url\((?<fontUrl>.+)\) format\('(?:opentype|truetype)'\)/u,
  );

  const fontUrl = resource?.groups?.fontUrl;

  if (fontUrl == null) {
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
  if (options.format === 'svg') {
    const font = await fetchFont(options.name, options.bold ? 700 : 400);
    const svg = await satori(<Component {...options} />, {
      width: options.size,
      height: options.size,
      fonts: [{ data: font, name: 'Noto Sans JP' }],
    });

    return svg;
  } else {
    const font = await fetchFont(options.name, options.bold ? 700 : 400);
    const svg = await satori(<Component {...options} />, {
      width: options.size,
      height: options.size,
      fonts: [{ data: font, name: 'Noto Sans JP' }],
    });

    const resvg = new Resvg(svg);
    resvg.cropByBBox(resvg.innerBBox()!);
    const image = resvg.render().asPng();

    return image;
  }
}
