import { CategoryResponse } from '../models/category';

export const getCategories = (): Promise<CategoryResponse[]> => {
  return fetch(`${process.env.REACT_APP_API}/categories`).then((response) => (response.json() as unknown) as CategoryResponse[]);
};
