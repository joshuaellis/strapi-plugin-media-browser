# Strapi Media Browser

[![Version](https://img.shields.io/npm/v/strapi-plugin-media-browser?style=flat&colorA=0855c9&colorB=0855c9)](https://www.npmjs.com/package/strapi-plugin-media-browser)
[![Downloads](https://img.shields.io/npm/dt/strapi-plugin-media-browser.svg?style=flat&colorA=0855c9&colorB=0855c9)](https://www.npmjs.com/package/strapi-plugin-media-browser)

> ⚠️ This is still in active development and as such not all features will be implemented ⚠️

<b>A convenient way to browse, manage and select all your Strapi assets, inspired by MacOS.</b>

## Features

### Manage and organise your assets

- Support for batch uploads with drag and drop support
- Manage tags directly within the plugin interface
- Tag your assets individually or in bulk
- Complete control of your folder structure (incl. nested)
- View asset metadata and a limited subset of EXIF data, if present
- And more!

### Built for large datasets

- Virtualized grid for super speedy browsing, even with thousands of assets and tags

### Granular search tools

- Refine your search with any combination of search facets such as filtering by tag name, asset usage, file size, orientation, type (and more)
- Use text search for a quick lookup by title, description and alt text

## Installation & Usage

```shell
yarn add strapi-plugin-media-browser
```

In your `config/plugins` file add:

```json
  "media-browser": {
    enabled: true,
  },
```

<!-- ## Configuration Options -->

<!-- ## FAQs -->

## Contributing

Contributions, issues and feature requests are welcome! See our [guide](https://github.com/joshuaellis/strapi-plugin-media-browser/blob/main/CONTRIBUTING.md) for more instructions!

## Roadmap

Interested in seeing the direciton of this plugin before you make the investment? Check out the [roadmap](https://github.com/users/joshuaellis/projects/1?query=is%3Aopen+sort%3Aupdated-desc).
