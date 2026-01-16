import React, { createElement } from 'react'
import { addons, types } from 'storybook/manager-api'
import { ADDON_ID, PANEL_ID } from './addons/networkPanel/constants'
import { NetworkPanel } from './addons/networkPanel/Panel'

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Network',
    match: ({ viewMode }) => viewMode === 'story',
    render: ({ active }) => createElement(NetworkPanel, { active: active ?? false }),
  })
})
