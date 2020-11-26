import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit';

import { getAuthors, updateAuthor, searchAuthors } from '../../services/authors';
import { RootState } from '../../store';
import { videosReceived, videosSelector, videoUpsertMany, videoDelete } from '../videos/videosSlice';
import { categoriesSelector } from '../categories/categoriesSlice';
import {
  AuthorResponse,
  AuthorEntity,
  extractVideoEntitiesFromResponse,
  createEntity,
  AuthorView,
  transformAuthorEntityToView,
  transformAuthorEntityToResponse,
  transformAuthorResponseToEntity,
  addVideoToAuthorResponse,
  removeVideoToAuthorResponse,
  updateVideoToAuthorResponse,
} from '../../models/author';
import { VideoEntity, transformVideoEntityToResponse } from '../../models/video';

const authorsAdapter = createEntityAdapter<AuthorEntity>({
  selectId: (entity) => entity.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export const fetchAuthors = createAsyncThunk(
  'authors/fetchAll',
  async (_, thunkApi): Promise<AuthorEntity[]> => {
    const results = await getAuthors();
    const videos: VideoEntity[] = [];
    const authors: AuthorEntity[] = [];

    results.forEach((x) => {
      const videosOfAuthor = extractVideoEntitiesFromResponse(x);
      const videoIds = videosOfAuthor.map((z) => z.id);
      videos.push(...videosOfAuthor);
      authors.push(createEntity(x.id, x.name, videoIds));
    });

    thunkApi.dispatch(videosReceived(videos));
    return authors;
  },
  {
    condition: (_, { getState }) => {
      const authorsState = (getState() as RootState).authors;
      if (authorsState.isUpdating) return false;
      if (authorsState.lastFetched === -1) return;
      const currentTimestamp = Date.now();
      const isExpired = Math.abs(currentTimestamp - authorsState.lastFetched) / 1000 > 30;
      if (isExpired) {
        return;
      }
      return false;
    },
  }
);

export const fetchAuthorsBySearch = createAsyncThunk(
  'authors/fetchBySearch',
  async (searchTerm: string, thunkApi): Promise<AuthorEntity[]> => {
    const results = await searchAuthors(searchTerm);
    const videos: VideoEntity[] = [];
    const authors: AuthorEntity[] = [];

    results.forEach((x) => {
      const videosOfAuthor = extractVideoEntitiesFromResponse(x);
      const videoIds = videosOfAuthor.map((z) => z.id);
      videos.push(...videosOfAuthor);
      authors.push(createEntity(x.id, x.name, videoIds));
    });

    thunkApi.dispatch(videosReceived(videos));
    return authors;
  }
);

// export const fetchAuthorById = createAsyncThunk(
//   'authors/fetchById',
//   async (id: AuthorEntity['id'], thunkApi): Promise<AuthorEntity> => {
//     const [author] = await Promise.all([getAuthorById(id), thunkApi.dispatch(fetchCategories)]);
//     const videos = extractVideoEntitiesFromResponse(author);
//     thunkApi.dispatch(videosReceived(videos));
//     return transformAuthorResponseToEntity(author);
//   }
// );

export const saveVideoToAuthor = createAsyncThunk(
  'authors/saveVideo',
  async (video: VideoEntity, thunkApi): Promise<AuthorEntity[] | undefined> => {
    const { authorId, ...data } = video;
    const state = thunkApi.getState() as RootState;
    const authors = state.authors.entities;
    const nextAuthor = authors[authorId];

    if (!nextAuthor) return undefined;

    const videos = videosSelector.selectEntities(state);
    const authorPayload = transformAuthorEntityToResponse(nextAuthor, videos);
    const selectedVideo = videos[video.id];

    const videoPayload = selectedVideo && transformVideoEntityToResponse({ ...selectedVideo, ...data });
    const isAuthorChanged = selectedVideo && selectedVideo.authorId !== nextAuthor.id;
    const previousAuthor = isAuthorChanged && selectedVideo && authors[selectedVideo.authorId];
    const authorToRemoveVideo = previousAuthor && transformAuthorEntityToResponse(previousAuthor, videos);

    const requests: AuthorResponse[] = [];
    if (authorToRemoveVideo && selectedVideo && videoPayload) {
      requests.push(removeVideoToAuthorResponse(authorToRemoveVideo, selectedVideo.id));
      requests.push(addVideoToAuthorResponse(authorPayload, videoPayload));
    }

    if (videoPayload && isAuthorChanged === false) {
      requests.push(updateVideoToAuthorResponse(authorPayload, videoPayload));
    }

    if (!selectedVideo) {
      requests.push(addVideoToAuthorResponse(authorPayload, data));
    }

    // if (selectedVideo) {
    //   const videoPayload = transformVideoEntityToResponse({ ...selectedVideo, ...data });
    //   if (selectedVideo.authorId !== nextAuthor.id) {
    //     const previousAuthor = authors[selectedVideo.authorId];
    //     if (previousAuthor) {
    //       const authorToRemoveVideo = transformAuthorEntityToResponse(previousAuthor, videos);
    //       requests.push(removeVideoToAuthorResponse(authorToRemoveVideo, selectedVideo.id));
    //       requests.push(addVideoToAuthorResponse(authorPayload, videoPayload));
    //     }
    //   } else {
    //     requests.push(updateVideoToAuthorResponse(authorPayload, videoPayload));
    //   }
    // } else {
    //   requests.push(addVideoToAuthorResponse(authorPayload, data));
    // }

    const results = await Promise.all(requests.map(updateAuthor));

    results.forEach((x) => {
      const authorVideos = extractVideoEntitiesFromResponse(x);
      thunkApi.dispatch(videoUpsertMany(authorVideos));
    });

    return results.map(transformAuthorResponseToEntity);
  }
);

export const deleteVideoFromAuthor = createAsyncThunk(
  'authors/deleteVideo',
  async (id: VideoEntity['id'], thunkApi): Promise<AuthorEntity | undefined> => {
    const state = thunkApi.getState() as RootState;
    const videos = videosSelector.selectEntities(state);
    const authors = state.authors.entities;

    const video = videos[id];
    if (!video) return undefined;

    const author = authors[video.authorId];
    if (!author) return undefined;

    const payload = transformAuthorEntityToResponse(author, videos);
    const response = await updateAuthor({
      ...payload,
      videos: payload.videos.filter((x) => x.id !== video.id),
    });

    thunkApi.dispatch(videoDelete(video.id));
    const result = transformAuthorResponseToEntity(response);
    return result;
  }
);

export const authorsSlice = createSlice({
  name: 'videos',
  initialState: authorsAdapter.getInitialState({
    isUpdating: false,
    lastFetched: -1,
  }),
  reducers: {
    authorsReceived: authorsAdapter.setAll,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAuthors.fulfilled, (state, action) => {
      authorsAdapter.setAll(state, action.payload);
      state.lastFetched = Date.now();
      state.isUpdating = false;
    });
    builder.addCase(fetchAuthors.pending, (state) => {
      state.isUpdating = true;
    });
    // builder.addCase(fetchAuthorById.fulfilled, (state, action) => {
    //   const author = action.payload;
    //   if (author) {
    //     authorsAdapter.upsertOne(state, author);
    //   }
    //   state.isUpdating = false;
    // });
    // builder.addCase(fetchAuthorById.pending, (state) => {
    //   state.isUpdating = true;
    // });
    builder.addCase(saveVideoToAuthor.fulfilled, (state, action) => {
      const authors = action.payload;
      if (authors) {
        authorsAdapter.updateMany(
          state,
          authors.map(({ id, ...changes }) => ({ id, changes }))
        );
      }
      state.isUpdating = false;
    });
    builder.addCase(saveVideoToAuthor.pending, (state) => {
      state.isUpdating = true;
    });
    builder.addCase(deleteVideoFromAuthor.fulfilled, (state, action) => {
      const author = action.payload as AuthorEntity;
      const { id, ...changes } = author;
      if (author) {
        authorsAdapter.updateOne(state, {
          id,
          changes,
        });
      }
      state.isUpdating = false;
    });
    builder.addCase(deleteVideoFromAuthor.pending, (state) => {
      state.isUpdating = true;
    });
    builder.addCase(fetchAuthorsBySearch.fulfilled, (state, action) => {
      authorsAdapter.setAll(state, action.payload);
      state.lastFetched = -1;
      state.isUpdating = false;
    });
    builder.addCase(fetchAuthorsBySearch.pending, (state) => {
      state.isUpdating = true;
    });
  },
});

export const { authorsReceived } = authorsSlice.actions;

export const authorsSelector = authorsAdapter.getSelectors<RootState>((state) => state.authors);
export const allAuthors = (state: RootState): AuthorView[] => {
  const videos = videosSelector.selectEntities(state);
  const categories = categoriesSelector.selectEntities(state);
  const authors = authorsSelector.selectAll(state);
  return authors.map((x) => transformAuthorEntityToView(x, videos, categories));
};

export const isAuthorsUpdating = (state: RootState): boolean => state.authors.isUpdating;

export default authorsSlice.reducer;
