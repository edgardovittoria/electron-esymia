import React, { FC, Fragment, useEffect, useState } from 'react';
import { Item, Menu, Separator, useContextMenu } from 'react-contexify';
import { ActionCreators } from 'redux-undo';
import { GiCubeforce } from 'react-icons/gi';
import { useDispatch, useSelector } from 'react-redux';
import { BiSolidRename, BiSolidShare, BiSolidTrash } from 'react-icons/bi';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react/dist';
import { deleteFileS3, openModel } from '../../../aws/crud';
import {
  deleteFaunadbModel,
  updateModelInFauna,
} from '../../../faunaDB/functions';
import { selectModel, updateModel } from '../../../store/modelSlice';
import RenameModal from './modal/RenameModal';
import { SearchUserAndShare } from './searchUserAndShare/searchUserAndShare';
import { useFaunaQuery } from '../../../../esymia/faunadb/hook/useFaunaQuery';
import { FaunaCadModel, resetState } from '../../../../cad_library';
import { getSimulationProjectsByOwner } from '../../../../esymia/faunadb/projectsFolderAPIs';
import { useAuth0 } from '@auth0/auth0-react';
import { DynamoProject } from '../../../../esymia/model/DynamoModels';
import { ThemeSelector } from '../../../../esymia/store/tabsAndMenuItemsSlice';
import { useDynamoDBQuery } from '../../../../dynamoDB/hook/useDynamoDBQuery';
import { getSimulationProjectsByUserEmailDynamoDB } from '../../../../dynamoDB/projectsFolderApi';
import { convertFromDynamoDBFormat } from '../../../../dynamoDB/utility/formatDynamoDBData';
import { deleteModelDynamoDB } from '../../../../dynamoDB/modelsApis';

export interface ContextMenuProps {
  model: FaunaCadModel;
  setShowCad: (v: boolean) => void;
  deleteModel: (v: FaunaCadModel) => void;
}

const MyProject: React.FC<ContextMenuProps> = ({
  model,
  setShowCad,
  deleteModel,
}) => {
  const dispatch = useDispatch();
  const { execQuery2 } = useDynamoDBQuery();
  const { user } = useAuth0();
  const [modalRenameShow, setModalRenameShow] = useState<boolean>(false);
  const [serchUserAndShare, setSerchUserAndShare] = useState<boolean>(false);
  const [modelErasable, setModelErasable] = useState(true);
  const theme = useSelector(ThemeSelector);
  const isDark = theme !== 'light';

  const { show, hideAll } = useContextMenu({
    id: model.components,
  });
  function handleContextMenu(event: any) {
    event.preventDefault();
    show({
      event,
      props: {
        key: 'value',
      },
    });
  }
  useEffect(() => {
    execQuery2(getSimulationProjectsByUserEmailDynamoDB, (process.env.APP_VERSION === 'demo') ? user?.name : user?.email, dispatch).then(
      (res) => {
        let projects: any[] = []
        if (res.Items) {
          res.Items.forEach((i: any) => projects.push(convertFromDynamoDBFormat(i)))
        }
        projects.forEach((p) => {
          if (p.modelS3 === model.components) {
            setModelErasable(false);
          }
        });
      },
    );
  }, []);

  return (
    <div key={model.id} className="relative group">
      {modalRenameShow && (
        <RenameModal setRenameModalShow={setModalRenameShow} model={model} />
      )}

      <div
        className={`glass-panel ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} p-8 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer relative overflow-hidden`}
        onClick={() => {
          dispatch(resetState());
          dispatch(ActionCreators.clearHistory());
          openModel(
            process.env.REACT_APP_AWS_BUCKET_NAME as string,
            model.components,
            dispatch,
            setShowCad,
          );
          dispatch(selectModel(model));
        }}
        onContextMenu={handleContextMenu}
      >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${isDark ? 'from-blue-500/10 to-purple-500/10' : 'from-blue-500/5 to-purple-500/5'}`} />

        <div className={`p-4 rounded-full ${isDark ? 'bg-white/5' : 'bg-black/5'} group-hover:scale-110 transition-transform duration-300`}>
          <GiCubeforce size={48} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
        </div>

        <span className={`font-semibold text-lg tracking-wide ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{model.name}</span>

        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Right-click for options</div>
      </div>

      <Menu id={model.components} theme={isDark ? 'dark' : 'light'} animation="fade">
        <Item
          onClick={(e) => {
            e.event.preventDefault();
            setModalRenameShow(true);
          }}
        >
          <div className="flex w-full flex-row justify-between items-center gap-4">
            <span>Rename</span>
            <BiSolidRename size={16} />
          </div>
        </Item>
        <Separator />
        <Item
          disabled={!modelErasable}
          onClick={(e) => {
            e.event.preventDefault();
            // eslint-disable-next-line no-restricted-globals
            const conf = confirm(`Are you sure to delete model ${model.name}?`);
            if (conf) {
              deleteFileS3(model.components)
                .then(() => {
                  // cancellare documento fauna
                  execQuery2(deleteModelDynamoDB, model.id as string, dispatch)
                    .then(() => {
                      deleteModel(model);
                      return 'deleted';
                    })
                    .catch((err) => console.log(err));
                })
                .catch((err) => console.log(err));
            }
          }}
        >
          {modelErasable ? (
            <div className="flex w-full flex-row justify-between items-center gap-4 text-red-500">
              <span>Delete</span>
              <BiSolidTrash size={16} />
            </div>
          ) : (
            <div className="flex w-full flex-row justify-between items-center gap-4 opacity-50 cursor-not-allowed" title="Cannot delete: used in a project">
              <span>Delete</span>
              <BiSolidTrash size={16} />
            </div>
          )}
        </Item>
      </Menu>
    </div>
  );
};

export default MyProject;
