import {EFileType} from './enums/fileType';
import {EEntityType} from './enums/entityType';
import {Insertable, Selectable, Updateable} from 'kysely';

export interface FileTable {
  id: string;
  fileType: EFileType;
  entityTypeId: EEntityType | null;
  entityId: number | null;
}

export type IFile = Selectable<FileTable>;
export type NewFile = Insertable<FileTable>;
export type FileUpdate = Updateable<FileTable>;
