import { useStorybookApi, useStorybookState } from '@storybook/manager-api';
import { IconButton, Icons, FlexBar, TabBar, TabButton, ScrollArea } from '@storybook/components';
import { Location, Route } from '@storybook/router';
import { styled } from '@storybook/theming';
import { global } from '@storybook/global';
import type { FC, SyntheticEvent } from 'react';
import React, { Fragment } from 'react';

import { AboutPage } from './about_page';
import { WhatsNewPage } from './whats_new_page';
import { ShortcutsPage } from './shortcuts_page';
import { matchesModifiers, matchesKeyCode } from '../keybinding';

const { document } = global;

const TabBarButton = React.memo(function TabBarButton({
  changeTab,
  id,
  title,
}: {
  changeTab: (tab: string) => void;
  id: string;
  title: string;
}) {
  return (
    <Location>
      {({ path }) => {
        const active = path.includes(`settings/${id}`);
        return (
          <TabButton
            id={`tabbutton-${id}`}
            className={['tabbutton'].concat(active ? ['tabbutton-active'] : []).join(' ')}
            type="button"
            key="id"
            active={active}
            onClick={() => changeTab(id)}
            role="tab"
          >
            {title}
          </TabButton>
        );
      }}
    </Location>
  );
});

const Content = styled(ScrollArea)(
  {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'auto',
  },
  ({ theme }) => ({
    background: theme.background.content,
  })
);

const Pages: FC<{
  onClose: () => void;
  enableShortcuts?: boolean;
  changeTab: (tab: string) => void;
  enableWhatsNew: boolean;
}> = ({ changeTab, onClose, enableShortcuts = true, enableWhatsNew }) => {
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (!enableShortcuts || event.repeat) return;
      if (matchesModifiers(false, event) && matchesKeyCode('Escape', event)) {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [enableShortcuts, onClose]);

  return (
    <Fragment>
      <FlexBar border>
        <TabBar role="tablist">
          <TabBarButton id="about" title="About" changeTab={changeTab} />
          {enableWhatsNew && (
            <TabBarButton id="whats-new" title="What's new?" changeTab={changeTab} />
          )}
          <TabBarButton id="shortcuts" title="Keyboard shortcuts" changeTab={changeTab} />
        </TabBar>
        <IconButton
          onClick={(e: SyntheticEvent) => {
            e.preventDefault();
            return onClose();
          }}
          title="Close settings page"
        >
          <Icons icon="close" />
        </IconButton>
      </FlexBar>
      <Content vertical horizontal={false}>
        <Route path="about">
          <AboutPage key="about" />
        </Route>
        <Route path="whats-new">
          <WhatsNewPage key="whats-new" />
        </Route>
        <Route path="shortcuts">
          <ShortcutsPage key="shortcuts" />
        </Route>
      </Content>
    </Fragment>
  );
};

const SettingsPages: FC = () => {
  const api = useStorybookApi();
  const state = useStorybookState();
  const changeTab = (tab: string) => api.changeSettingsTab(tab);

  return (
    <Pages
      enableWhatsNew={state.whatsNewData?.status === 'SUCCESS'}
      enableShortcuts={state.ui.enableShortcuts}
      changeTab={changeTab}
      onClose={api.closeSettings}
    />
  );
};

export { SettingsPages as default };
