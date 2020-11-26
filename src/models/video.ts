import { Dictionary } from '@reduxjs/toolkit';
import { AuthorEntity } from './author';
import { CategoryView, CategoryEntity, transformCategoryIdsToEntities } from './category';
import * as yup from 'yup';

export interface VideoResponse {
  id: number;
  name: string;
  catIds: number[];
}

export const videoSchema = yup
  .object({
    name: yup.string().required(),
    catIds: yup.array().min(1).required(),
    authorId: yup.number().required(),
  })
  .defined();

export type VideoEntity = VideoResponse & {
  authorId: AuthorEntity['id'];
};

export type VideoView = Omit<VideoEntity, 'authorId' | 'catIds'> & {
  author: Omit<AuthorEntity, 'videoIds'>;
  categories: CategoryView[];
};

export function transformVideoEntityToResponse(video: VideoEntity): VideoResponse {
  return {
    catIds: video.catIds,
    id: video.id,
    name: video.name,
  };
}

export function transformVideoEntityToView(
  video: VideoEntity,
  authorsLookup: Dictionary<AuthorEntity>,
  categoriesLookup: Dictionary<CategoryEntity>
): VideoView | undefined {
  const author = authorsLookup[video.authorId];
  const categories = transformCategoryIdsToEntities(video.catIds, categoriesLookup);
  if (author) {
    return {
      id: video.id,
      name: video.name,
      categories,
      author: {
        id: author.id,
        name: author.name,
      },
    };
  }
  return undefined;
}
