import React from "react";
import { NotFound } from "@strapi/helper-plugin";
import { Switch, Route } from "react-router-dom";
import { useIntl } from "react-intl";
import { Helmet } from "react-helmet";
import { Main } from "@strapi/design-system";
import { Provider } from "react-redux";

import { Finder, finderReducer } from "../Finder";

import { prefixTranslation } from "../../helpers/translations";

import pluginId from "../../pluginId";

import { createStore } from "../../store";

import { Header } from "../../components/Header";

const store = createStore({
  finder: finderReducer,
});

const App: React.FunctionComponent = () => {
  const { formatMessage } = useIntl();
  const title = formatMessage({
    id: prefixTranslation("plugin.name"),
    defaultMessage: "Media Library",
  });

  return (
    <Provider store={store}>
      <Main>
        <Helmet title={title} />
        <Header></Header>
        <Switch>
          <Route exact path={`/plugins/${pluginId}`} component={Finder} />
          <Route component={NotFound} />
        </Switch>
      </Main>
    </Provider>
  );
};

export default App;
