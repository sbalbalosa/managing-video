import { Dictionary } from '@reduxjs/toolkit';
import { CategoryEntity, transformCategoryIdsToEntities } from './category';
import { VideoResponse, VideoEntity, VideoView } from './video';

export interface AuthorResponse {
  id: number;
  name: string;
  videos: VideoResponse[];
}

export type AuthorEntity = Omit<AuthorResponse, 'videos'> & { videoIds: VideoEntity['id'][] };
export type AuthorView = Omit<AuthorResponse, 'videos'> & { videos: Omit<VideoView, 'author'>[] };

export function transformAuthorEntityToView(
  entity: AuthorEntity,
  videosLookup: Dictionary<VideoEntity>,
  categoriesLookup: Dictionary<CategoryEntity>
): AuthorView {
  const videos: AuthorView['videos'] = [];
  entity.videoIds.forEach((x) => {
    const video = videosLookup[x];
    if (video) {
      const categories = transformCategoryIdsToEntities(video.catIds, categoriesLookup);
      videos.push({
        categories,
        id: video.id,
        name: video.name,
      });
    }
  });
  return {
    id: entity.id,
    name: entity.name,
    videos,
  };
}

export function transformAuthorEntityToResponse(entity: AuthorEntity, videosLookup: Dictionary<VideoEntity>): AuthorResponse {
  const videos: AuthorResponse['videos'] = [];
  entity.videoIds.forEach((x) => {
    const video = videosLookup[x];
    if (video) {
      const { authorId, ...rest } = video;
      videos.push(rest);
    }
  });
  const { videoIds, ...restAuthor } = entity;
  return {
    ...restAuthor,
    videos,
  };
}

export function transformAuthorResponseToEntity(response: AuthorResponse): AuthorEntity {
  return {
    id: response.id,
    name: response.name,
    videoIds: response.videos.map((x) => x.id),
  };
}

export function extractVideoEntitiesFromResponse(response: AuthorResponse): VideoEntity[] {
  return response.videos.map((y) => ({ ...y, authorId: response.id } as VideoEntity));
}

export function createEntity(id: AuthorResponse['id'], name: AuthorResponse['name'], videoIds: VideoEntity['id'][]): AuthorEntity {
  return {
    id,
    name,
    videoIds,
  };
}

export function addVideoToAuthorResponse(author: AuthorResponse, video: VideoResponse & { id?: VideoResponse['id'] }): AuthorResponse {
  const newVideo = {
    ...video,
    id: Date.now(), // TODO: this is a workaround for json-server with no id
  };
  return {
    ...author,
    videos: author.videos.concat(video.id ? video : newVideo),
  };
}

export function removeVideoToAuthorResponse(author: AuthorResponse, id: VideoResponse['id']): AuthorResponse {
  return {
    ...author,
    videos: author.videos.filter((x) => x.id !== id),
  };
}

export function updateVideoToAuthorResponse(author: AuthorResponse, video: VideoResponse): AuthorResponse {
  return {
    ...author,
    videos: author.videos.map((x) => {
      if (x.id === video.id) {
        return {
          id: video.id,
          name: video.name,
          catIds: video.catIds,
        };
      }
      return x;
    }),
  };
}
