export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number;
  cover: string;
  license: string;
  source: string;
  streamUrl: string;
};

export const genres = [
  'All',
  'Electronic',
  'Pop',
  'Rock',
  'Jazz',
  'Ambient',
  'Lo-fi',
  'Classical',
  'Hip-Hop',
  'Folk',
  'World',
  'Soundtrack',
];

function buildToneStream(frequency: number, durationSeconds = 5) {
  const sampleRate = 22050;
  const totalSamples = sampleRate * durationSeconds;
  const buffer = new ArrayBuffer(44 + totalSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + totalSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, false);
  view.setUint16(22, 1, false);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, false);
  view.setUint16(34, 16, false);
  writeString(36, 'data');
  view.setUint32(40, totalSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t) * 0.5;
    view.setInt16(offset, sample * 32767, true);
    offset += 2;
  }

  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
}

export const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Sunrise Echoes',
    artist: 'Luma Harbor',
    album: 'Dawn Signals',
    genre: 'Ambient',
    duration: 210,
    cover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80',
    license: 'CC-BY',
    source: 'Jamendo',
    streamUrl: buildToneStream(220, 3.5),
  },
  {
    id: '2',
    title: 'Night Signals',
    artist: 'Arcadia Found',
    album: 'Afterglow Circuit',
    genre: 'Electronic',
    duration: 246,
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80',
    license: 'CC-BY-SA',
    source: 'Internet Archive',
    streamUrl: buildToneStream(330, 4.1),
  },
  {
    id: '3',
    title: 'Glass Horizon',
    artist: 'Morrow Lane',
    album: 'Soft Static',
    genre: 'Lo-fi',
    duration: 198,
    cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    license: 'public-domain',
    source: 'Wikimedia Commons',
    streamUrl: buildToneStream(180, 3.3),
  },
  {
    id: '4',
    title: 'Lanterns in Bloom',
    artist: 'The Quiet Echoes',
    album: 'Field Notes',
    genre: 'Folk',
    duration: 232,
    cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=800&q=80',
    license: 'CC-BY-NC',
    source: 'Jamendo',
    streamUrl: buildToneStream(260, 3.9),
  },
  {
    id: '5',
    title: 'Velvet Horizon',
    artist: 'North Meridian',
    album: 'Blue Drift',
    genre: 'Pop',
    duration: 201,
    cover: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=800&q=80',
    license: 'CC-BY',
    source: 'Creative Commons',
    streamUrl: buildToneStream(290, 3.35),
  },
  {
    id: '6',
    title: 'Copper Rain',
    artist: 'Seabloom',
    album: 'Weathered Light',
    genre: 'Jazz',
    duration: 268,
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    license: 'public-domain',
    source: 'Public Domain',
    streamUrl: buildToneStream(150, 4.5),
  },
];
