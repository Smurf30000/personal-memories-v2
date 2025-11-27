/**
 * Album data structure stored in Firestore
 */
export interface Album {
  id: string;
  name: string;
  userId: string;
  coverImageUrl?: string;
  mediaIds: string[]; // Array of media IDs in this album
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create album input
 */
export interface CreateAlbumInput {
  name: string;
  userId: string;
}

/**
 * Update album input
 */
export interface UpdateAlbumInput {
  name?: string;
  coverImageUrl?: string;
  mediaIds?: string[];
}
