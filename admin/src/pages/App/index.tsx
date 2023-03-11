import * as React from 'react';
import styled from 'styled-components';
import { NotFound } from '@strapi/helper-plugin';
import { Switch, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Main } from '@strapi/design-system';
import { Provider } from 'react-redux';

import { Finder } from '../Finder';

import { prefixTranslation } from '../../helpers/translations';

import { store } from '../../store/store';
import { BASE_URL } from '../../constants';

const App: React.FunctionComponent = () => {
  return (
    <Provider store={store}>
      <MediaMain>
        <Helmet title={'Media Library'} />
        <Switch>
          <Route path={BASE_URL} component={Finder} />
          <Route component={NotFound} />
        </Switch>
      </MediaMain>
    </Provider>
  );
};

const MediaMain = styled(Main)`
  background-color: #171717;
  color: #fafafa;
  display: grid;
  grid-template-columns: min-content 1fr 1fr;
  grid-template-rows: 60px 1fr;
  height: 100vh;

  & *:focus-visible {
    outline: 2px solid #0855c9;
  }
`;

export default App;
