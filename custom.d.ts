declare module '@strapi/design-system/*';
declare module '@strapi/design-system';
declare module '@strapi/helper-plugin';
declare module '@strapi/utils';

declare module '@strapi/database' {
  import { WhereParams, Sortables, Direction } from '@strapi/database';

  interface FindParams<T> {
    select?: (keyof T)[];
    // TODO: add nested operators & relations
    where?: WhereParams<T>;
    limit?: number;
    offset?: number;
    orderBy?: // TODO: add relations
    | Sortables<T>
      | Sortables<T>[]
      | { [K in Sortables<T>]?: Direction }
      | { [K in Sortables<T>]?: Direction }[];
    populate?:
      | (keyof TEntity)[]
      | { [Key in keyof TEntity]?: { count: boolean } | boolean | object };
  }
}
