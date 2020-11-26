import { Dictionary } from '@reduxjs/toolkit';

export interface CategoryResponse {
  id: number;
  name: string;
}

export type CategoryEntity = CategoryResponse;
export type CategoryView = CategoryEntity;

export function transformCategoryIdsToEntities(
  ids: CategoryEntity['id'][],
  categoriesLookup: Dictionary<CategoryEntity>
): CategoryEntity[] {
  const categories: CategoryEntity[] = [];
  ids.forEach((x) => {
    const category = categoriesLookup[x];
    if (category) {
      categories.push(category);
    }
  });
  return categories;
}
