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
  ],
};
