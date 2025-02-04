export enum EImageExtension {
  // Images
  AVIF = 'avif',
  WEBP = 'webp',
  JPEG = 'jpeg',
}

export enum EAudioExtension {
  MP3 = 'mp3',
  WAV = 'wav',
  M4A = 'm4a',
  AAC = 'aac',
}

export type Extension = EImageExtension | EAudioExtension;
