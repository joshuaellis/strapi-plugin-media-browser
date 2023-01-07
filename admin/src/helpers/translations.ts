import pluginId from "../pluginId";

export const prefixTranslation = (translationId: string) =>
  `${pluginId}.${translationId}`;
