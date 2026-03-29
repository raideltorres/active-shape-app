import React, { useState } from 'react';

import TabBar from '../../components/atoms/TabBar';
import { TabScreenLayout } from '../../components/templates';
import FaqTab from './FaqTab';
import BugReportsTab from './BugReportsTab';
import SuggestionsTab from './SuggestionsTab';

const TABS = [
  { key: 'faq', label: 'FAQ', icon: 'help-circle-outline' },
  { key: 'bugs', label: 'Bug Reports', icon: 'bug-outline' },
  { key: 'suggestions', label: 'Suggestions', icon: 'bulb-outline' },
];

const HelpScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('faq');

  return (
    <TabScreenLayout
      title="Help & Support"
      subtitle="Browse questions, report bugs, or share ideas."
      showBackButton
      onBackPress={() => navigation.goBack()}
    >
      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'faq' && <FaqTab />}
      {activeTab === 'bugs' && <BugReportsTab />}
      {activeTab === 'suggestions' && <SuggestionsTab />}
    </TabScreenLayout>
  );
};

export default HelpScreen;
