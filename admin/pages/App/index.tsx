import * as React from 'react';

import { Main } from '@strapi/design-system';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import styled from 'styled-components';

import { Notifications } from '../../components/Notifications';
import { BASE_URL } from '../../constants';
import { store } from '../../store/store';
import { Finder } from '../Finder';

const App: React.FunctionComponent = () => {
  React.useLayoutEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <Provider store={store}>
      <MediaMain>
        <Helmet title={'Media Browser'} />
        <Switch>
          <Route path={BASE_URL} component={Finder} />
        </Switch>
      </MediaMain>
      <Notifications />
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
