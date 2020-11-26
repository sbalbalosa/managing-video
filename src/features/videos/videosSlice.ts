import { createSlice, createEntityAdapter, createAsyncThunk, Dictionary } from '@reduxjs/toolkit';

import { RootState } from '../../store';
import { categoriesSelector, fetchCategories } from '../categories/categoriesSlice';
import { authorsSelector, fetchAuthors, saveVideoToAuthor, fetchAuthorsBySearch } from '../authors/authorsSlice';
import { VideoEntity, VideoView, transformVideoEntityToView } from '../../models/video';

const videosAdapter = createEntityAdapter<VideoEntity>({
  selectId: (entity) => entity.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export const fetchVideos = createAsyncThunk(
  'videos/fetchAll',
  async (_, thunkApi): Promise<void> => {
    await Promise.all([thunkApi.dispatch(fetchCategories()), thunkApi.dispatch(fetchAuthors())]);
  }
);

export const fetchVideoBySearch = createAsyncThunk(
  'videos/fetchBySearch',
  async (searchTerm: string, thunkApi): Promise<void> => {
    await thunkApi.dispatch(fetchAuthorsBySearch(searchTerm));
  }
);

export const saveVideo = createAsyncThunk(
  'videos/save',
  async (video: VideoEntity, thunkApi): Promise<void> => {
    await thunkApi.dispatch(saveVideoToAuthor(video));
    return;
  }
);

export const videosSlice = createSlice({
  name: 'videos',
  initialState: videosAdapter.getInitialState(),
  reducers: {
    videosReceived: videosAdapter.setAll,
    videoUpsertMany: videosAdapter.upsertMany,
    videoDelete: videosAdapter.removeOne,
    videosRemoveAll: videosAdapter.removeAll,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchVideoBySearch.pending, (state) => {
      videosAdapter.removeAll(state);
    });
  },
});

export const { videosReceived, videoUpsertMany, videoDelete, videosRemoveAll } = videosSlice.actions;

export const videosSelector = videosAdapter.getSelectors<RootState>((state) => state.videos);

export const videosLookup = (state: RootState): Dictionary<VideoEntity> => videosSelector.selectEntities(state);

// const sorter = {
//   name: (a: VideoView, b: VideoView) => a.name.localeCompare(b.name),
//   author: (a: VideoView, b: VideoView) => a.author.name.localeCompare(b.author.name),
// };

// export const videosSortedBy = (state: RootState): VideoEntity[] => {
//   //   const sorterFn = {
//   //   name: (a, b) => records.sort((a, b) => )
//   //   author: (a, b) => a.name.localeCompare(b.name),
//   // };
// };

export const allVideos = (state: RootState): VideoView[] => {
  const entities = videosSelector.selectAll(state);
  const authors = authorsSelector.selectEntities(state);
  const categories = categoriesSelector.selectEntities(state);
  const videoViews: VideoView[] = [];
  entities.forEach((x) => {
    const videoView = transformVideoEntityToView(x, authors, categories);
    if (videoView) {
      videoViews.push(videoView);
    }
  });
  return videoViews;
};

export const isVideosLoading = (state: RootState): boolean => state.categories.isUpdating || state.authors.isUpdating;

export default videosSlice.reducer;
