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
  const theme = useSelector(ThemeSelector)
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
    execQuery2(getSimulationProjectsByUserEmailDynamoDB, user?.email, dispatch).then(
      (res) => {
        let projects: any[] = []
        console.log(res)
        if(res.Items){
          res.Items.forEach((i:any) => projects.push(convertFromDynamoDBFormat(i)))
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
    <div key={model.id}>
      {modalRenameShow && (
        <RenameModal setRenameModalShow={setModalRenameShow} model={model} />
      )}
      {/* {serchUserAndShare && (
        <SearchUserAndShare
          setShowSearchUser={setSerchUserAndShare}
          modelToShare={model}
        />
      )} */}
      <div
        className={`px-10 py-12 relative rounded-xl border ${theme === 'light' ? 'border-textColor text-textColor hover:bg-secondaryColor hover:text-white' : 'border-textColorDark text-textColorDark hover:bg-secondaryColorDark hover:text-textColor'}  flex flex-col items-center hover:cursor-pointer hover:shadow-2xl`}
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
        <GiCubeforce size={75}  />
        <span className={`absolute bottom-2 font-semibold`}>{model.name}</span>
      </div>
      <Menu id={model.components}>
        <Item
          onClick={(e) => {
            e.event.preventDefault();
            setModalRenameShow(true);
          }}
        >
          <div className="flex w-full flex-row justify-between items-center">
            <span>Rename</span>
            <BiSolidRename size={20} />
          </div>
        </Item>
        {/* <Item
          onClick={(e) => {
            e.event.preventDefault();
            setSerchUserAndShare(true);
          }}
        >
          <div className="flex w-full flex-row justify-between items-center">
            <span>Share With</span>
            <BiSolidShare size={20} />
          </div>
        </Item> */}
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
            <div className="flex w-full flex-row justify-between items-center">
              <span>Delete</span>
              <BiSolidTrash size={20} />
            </div>
          ) : (
            <div className='flex flex-col items-center gap-5'>
              <div className="flex w-full flex-row justify-between items-center">
              <span>Delete</span>
              <BiSolidTrash size={20} />
            </div>
            <span className='text-xs'> It is not possible to delete the model  <br />since it is present in at least one <br /> esymia project. <br /> Make sure the project is not <br /> present in any esymia project <br /> and try again.</span>
            </div>
          )}
        </Item>
      </Menu>
    </div>
  );
};

export default MyProject;
