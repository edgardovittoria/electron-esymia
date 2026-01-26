import React, { useState } from 'react';
import MyFiles from './components/ProjectTabContent/MyFiles';

interface ProjectsProps {
  setLoadingSpinner: (value: boolean) => void;
}

export const Projects: React.FC<ProjectsProps> = ({ setLoadingSpinner }) => {
  const [showSearchUser, setShowSearchUser] = useState(false);
  const [showCreateNewFolderModal, setShowCreateNewFolderModal] =
    useState(false);
  return (
    <div className="w-full py-2 h-[calc(100vh-300px)]">
      <MyFiles
        showCreateNewFolderModal={showCreateNewFolderModal}
        setShowCreateNewFolderModal={setShowCreateNewFolderModal}
        showSearchUser={showSearchUser}
        setShowSearchUser={setShowSearchUser}
        setLoadingSpinner={setLoadingSpinner}
      />
    </div>
  );
};
