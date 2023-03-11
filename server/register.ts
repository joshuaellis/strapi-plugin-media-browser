import type { Strapi } from '@strapi/strapi';
import { mapValues } from 'lodash';

import { PLUGIN_NAME } from './constants';
import middleware from './middlewares';

export default ({ strapi }: { strapi: Strapi }) => {
  strapi.plugin(PLUGIN_NAME).provider = createProvider(
    strapi.config.get(`plugin.${PLUGIN_NAME}`, {})
  );

  middleware({ strapi });
};

const createProvider = (config) => {
  const { providerOptions, actionOptions = {} } = config;

  const providerName = config.provider.toLowerCase();
  let provider;

  let modulePath;
  try {
    modulePath = require.resolve(`@strapi/provider-upload-${providerName}`);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      modulePath = providerName;
    } else {
      throw error;
    }
  }

  try {
    provider = require(modulePath);
  } catch (err) {
    const newError = new Error(`Could not load upload provider "${providerName}".`);
    newError.stack = err.stack;
    throw newError;
  }

  const providerInstance = provider.init(providerOptions);

  if (!providerInstance.delete) {
    throw new Error(`The upload provider "${providerName}" doesn't implement the delete method.`);
  }

  if (!providerInstance.upload && !providerInstance.uploadStream) {
    throw new Error(
      `The upload provider "${providerName}" doesn't implement the uploadStream nor the upload method.`
    );
  }

  if (!providerInstance.uploadStream) {
    process.emitWarning(
      `The upload provider "${providerName}" doesn't implement the uploadStream function. Strapi will fallback on the upload method. Some performance issues may occur.`
    );
  }

  const wrappedProvider = mapValues(providerInstance, (method, methodName) => {
    return async function (file, options = actionOptions[methodName]) {
      return providerInstance[methodName](file, options);
    };
  });

  return Object.assign(Object.create(baseProvider), wrappedProvider);
};

const baseProvider = {
  extend(obj) {
    Object.assign(this, obj);
  },
};
