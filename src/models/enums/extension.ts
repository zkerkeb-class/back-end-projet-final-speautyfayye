export enum EImageExtension {
  // Images
  AVIF = 'avif',
  WEBP = 'webp',
  JPEG = 'jpeg',
}

export enum EAudioExtension {
  MP3 = 'mp3',
}

export type Extension = EImageExtension | EAudioExtension;
