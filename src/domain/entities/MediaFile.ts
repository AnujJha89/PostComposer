

export type MediaType = 'IMAGE' | 'VIDEO';

export interface MediaFileProps {
  id: string;
  fileName: string;
  fileSize: number; 
  mimeType: string;
  mediaType: MediaType;
  url: string; 
  uploadedAt: Date;
}

export class MediaFile {
  private readonly _id: string;
  private readonly _fileName: string;
  private readonly _fileSize: number;
  private readonly _mimeType: string;
  private readonly _mediaType: MediaType;
  private readonly _url: string;
  private readonly _uploadedAt: Date;

  constructor(props: MediaFileProps) {
    this._id = props.id;
    this._fileName = props.fileName;
    this._fileSize = props.fileSize;
    this._mimeType = props.mimeType;
    this._mediaType = props.mediaType;
    this._url = props.url;
    this._uploadedAt = props.uploadedAt;
  }

  static create(props: Omit<MediaFileProps, 'uploadedAt'>): MediaFile {
    if (!props.id) throw new Error('MediaFile id is required.');
    if (!props.fileName) throw new Error('MediaFile fileName is required.');
    if (props.fileSize <= 0) throw new Error('MediaFile fileSize must be positive.');
    if (!props.mimeType) throw new Error('MediaFile mimeType is required.');
    if (!props.url) throw new Error('MediaFile url is required.');
    return new MediaFile({ ...props, uploadedAt: new Date() });
  }

  get id(): string { return this._id; }
  get fileName(): string { return this._fileName; }
  get fileSize(): number { return this._fileSize; }
  get mimeType(): string { return this._mimeType; }
  get mediaType(): MediaType { return this._mediaType; }
  get url(): string { return this._url; }
  get uploadedAt(): Date { return this._uploadedAt; }

  get extension(): string {
    return this._fileName.split('.').pop()?.toLowerCase() ?? '';
  }

  get fileSizeKB(): number {
    return Math.round(this._fileSize / 1024);
  }

  isImage(): boolean {
    return this._mediaType === 'IMAGE';
  }

  isVideo(): boolean {
    return this._mediaType === 'VIDEO';
  }

  toPlainObject(): MediaFileProps {
    return {
      id: this._id,
      fileName: this._fileName,
      fileSize: this._fileSize,
      mimeType: this._mimeType,
      mediaType: this._mediaType,
      url: this._url,
      uploadedAt: this._uploadedAt,
    };
  }
}
