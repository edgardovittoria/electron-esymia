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
import { resetState } from '../../../../cad_library';
import { getSimulationProjectsByOwner } from '../../../../esymia/faunadb/projectsFolderAPIs';
import { useAuth0 } from '@auth0/auth0-react';
import { DynamoProject } from '../../../../esymia/model/DynamoModels';
import { ThemeSelector } from '../../../../esymia/store/tabsAndMenuItemsSlice';
import { useDynamoDBQuery } from '../../../../dynamoDB/hook/useDynamoDBQuery';
import { getSimulationProjectsByUserEmailDynamoDB } from '../../../../dynamoDB/projectsFolderApi';
import { convertFromDynamoDBFormat } from '../../../../dynamoDB/utility/formatDynamoDBData';
import { deleteModelDynamoDB } from '../../../../dynamoDB/modelsApis';
import { DynamoDBCadModel } from '../../../../cad_library/components/dynamodb/api/modelsAPIs';

export interface ContextMenuProps {
  model: DynamoDBCadModel;
  setShowCad: (v: boolean) => void;
  deleteModel: (v: DynamoDBCadModel) => void;
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


        <GiCubeforce size={82} className={isDark ? 'text-blue-400' : 'text-blue-600'} />

        <span className={`font-semibold text-lg tracking-wide ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{model.name}</span>

        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Right-click for options</div>
      </div>

      <Menu id={model.components} theme={isDark ? 'dark' : 'light'} animation="fade" className="!bg-transparent !p-0 !shadow-none">
        <div className={`rounded-xl border backdrop-blur-xl overflow-hidden shadow-2xl ${isDark ? 'bg-gray-900/90 border-white/10' : 'bg-white/90 border-white/40'}`}>
          <Item
            onClick={(e) => {
              e.event.preventDefault();
              setModalRenameShow(true);
            }}
            className={`!px-4 !py-3 transition-colors duration-200 ${isDark ? 'hover:!bg-white/10 text-gray-200' : 'hover:!bg-black/5 text-gray-700'}`}
          >
            <div className="flex w-full flex-row justify-between items-center gap-8">
              <span className="font-medium">Rename</span>
              <BiSolidRename size={18} className="opacity-70" />
            </div>
          </Item>
          <div className={`h-px w-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`} />
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
            className={`!px-4 !py-3 transition-colors duration-200 ${!modelErasable ? 'opacity-100 cursor-default' : isDark ? 'hover:!bg-red-500/20' : 'hover:!bg-red-50'}`}
          >
            {modelErasable ? (
              <div className="flex w-full flex-row justify-between items-center gap-8 text-red-500">
                <span className="font-medium">Delete</span>
                <BiSolidTrash size={18} />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex w-full flex-row justify-between items-center gap-8 opacity-50">
                  <span className="font-medium">Delete</span>
                  <BiSolidTrash size={18} />
                </div>
                <div className={`text-xs p-2 rounded-lg ${isDark ? 'bg-white/5 text-gray-400' : 'bg-black/5 text-gray-500'}`}>
                  It is not possible to delete the model since it is present in at least one esymia project.
                  <br />
                  Make sure the project is not present in any esymia project and try again.
                </div>
              </div>
            )}
          </Item>
        </div>
      </Menu>
    </div>
  );
};

export default MyProject;
