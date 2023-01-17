import { ACTIONS } from "../constants";

export default {
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/files",
      handler: "admin-file.find",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "admin::hasPermissions",
            config: {
              actions: [ACTIONS.read],
            },
          },
        ],
      },
    },
    {
      method: "POST",
      path: "/files",
      handler: "admin-file.upload",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
      },
    },
    {
      method: "GET",
      path: "/folders",
      handler: "admin-folder.find",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "admin::hasPermissions",
            config: {
              actions: [ACTIONS.read],
            },
          },
        ],
      },
    },
    {
      method: "POST",
      path: "/folders",
      handler: "admin-folder.create",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "admin::hasPermissions",
            config: {
              actions: [ACTIONS.create],
            },
          },
        ],
      },
    },
    {
      method: "DELETE",
      path: "/folders/:id",
      handler: "admin-folder.delete",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "admin::hasPermissions",
            config: {
              actions: [ACTIONS.delete],
            },
          },
        ],
      },
    },
    {
      method: "PUT",
      path: "/folders",
      handler: "admin-folder.update",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "admin::hasPermissions",
            config: {
              actions: [ACTIONS.update],
            },
          },
        ],
      },
    },
  ],
};