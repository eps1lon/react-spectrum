/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ComboBox, Item} from '../';
import {Grid, repeat} from '@react-spectrum/layout';
import {mergeProps} from '@react-aria/utils';
import {Meta, Story} from '@storybook/react';
import React from 'react';
import {SpectrumComboBoxProps} from '@react-types/combobox';

// Skipping focus styles because don't have a way of applying it via classnames
// No controlled open state also means no menu
let states = [
  {isQuiet: true},
  {isReadOnly: true},
  {isDisabled: true},
  {validationState: ['valid', 'invalid', undefined]},
  {isRequired: true},
  {necessityIndicator: 'label'}
];

// Generate a powerset of the options
let combinations: any[] = [{}];
for (let i = 0; i < states.length; i++) {
  let len = combinations.length;
  for (let j = 0; j < len; j++) {
    if (states[i].validationState) {
      states[i].validationState.forEach(state => {
        let merged = mergeProps(combinations[j], {validationState: state});
        combinations.push(merged);
      });
    } else {
      let merged = mergeProps(combinations[j], states[i]);
      combinations.push(merged);
    }
  }
}

function shortName(key, value) {
  let returnVal = '';
  switch (key) {
    case 'isQuiet':
      returnVal = 'quiet';
      break;
    case 'isReadOnly':
      returnVal = 'ro';
      break;
    case 'isDisabled':
      returnVal = 'disable';
      break;
    case 'validationState':
      returnVal = `vs ${value === undefined ? 'none' : value}`;
      break;
    case 'isRequired':
      returnVal = 'req';
      break;
    case 'necessityIndicator':
      returnVal = 'necInd=label';
      break;
  }
  return returnVal;
}

const meta: Meta<SpectrumComboBoxProps<object>> = {
  title: 'ComboBox'
};

export default meta;

let items = [
  {name: 'Aardvark', id: '1'},
  {name: 'Kangaroo', id: '2'},
  {name: 'Snake', id: '3'}
];

const Template: Story<SpectrumComboBoxProps<object>> = (args) => (
  <Grid columns={repeat(states.length, '1fr')} autoFlow="row" gap="size-300">
    {combinations.map(c => {
      let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
      if (!key) {
        key = 'empty';
      }

      return (
        <ComboBox key={key} {...args} {...c} label={args['aria-label'] ? undefined : key} defaultItems={items}>
          {(item: any) => <Item>{item.name}</Item>}
        </ComboBox>
      );
    })}
  </Grid>
);

const TemplateSideLabel: Story<SpectrumComboBoxProps<object>> = (args) => (
  <Grid columns={repeat(2, '1fr')} autoFlow="row" gap="size-200">
    {combinations.map(c => {
      let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
      if (!key) {
        key = 'empty';
      }

      return (
        <ComboBox key={key} {...args} {...c} label={args['aria-label'] ? undefined : key} defaultItems={items}>
          {(item: any) => <Item>{item.name}</Item>}
        </ComboBox>
      );
    })}
  </Grid>
);

const TemplateSmall: Story<SpectrumComboBoxProps<object>> = (args) => (
  <Grid columns={repeat(4, '1fr')} autoFlow="row" gap="size-200">
    {combinations.map(c => {
      let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
      if (!key) {
        key = 'empty';
      }

      return (
        <ComboBox key={key} {...args} {...c} label={args['aria-label'] ? undefined : key} defaultItems={items}>
          {(item: any) => <Item>{item.name}</Item>}
        </ComboBox>
      );
    })}
  </Grid>
);

// disabled, quiet, readonly, label postion/alignment, no label, isRequired, validationstate, placeholder, autoFocus, custom width

// label position/alignment down here, custom width down here,  no label
export const PropDefaults = Template.bind({});
PropDefaults.storyName = 'default';
PropDefaults.args = {};

export const PropSelectedKey = Template.bind({});
PropSelectedKey.storyName = 'selectedKey: 2';
PropSelectedKey.args = {selectedKey: '2'};

export const PropInputValue= Template.bind({});
PropInputValue.storyName = 'inputValue: Blah';
PropInputValue.args = {inputValue: 'Blah'};

export const PropAriaLabelled = Template.bind({});
PropAriaLabelled.storyName = 'aria-label';
PropAriaLabelled.args = {'aria-label': 'Label'};

export const PropLabelEnd = Template.bind({});
PropLabelEnd.storyName = 'label end';
PropLabelEnd.args = {...PropDefaults.args, labelAlign: 'end'};

export const PropLabelSide = TemplateSideLabel.bind({});
PropLabelSide.storyName = 'label side';
PropLabelSide.args = {...PropDefaults.args, labelPosition: 'side'};

export const PropCustomWidth = TemplateSmall.bind({});
PropCustomWidth.storyName = 'custom width';
PropCustomWidth.args = {...PropDefaults.args, width: 'size-3000'};
