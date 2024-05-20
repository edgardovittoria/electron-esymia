import React, { FC, Fragment, useState } from 'react';
import { Item, Menu, Separator, useContextMenu } from 'react-contexify';
import { FaunaCadModel, resetState, useFaunaQuery } from 'cad-library';
import { ActionCreators } from 'redux-undo';
import { GiCubeforce } from 'react-icons/gi';
import { useDispatch } from 'react-redux';
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

export interface ContextMenuProps {
  model: FaunaCadModel;
  setShowCad: (v: boolean) => void;
  deleteModel: (v: FaunaCadModel) => void;
}

const MySharedProject: React.FC<ContextMenuProps> = ({
  model,
  setShowCad,
  deleteModel,
}) => {
  const dispatch = useDispatch();
  const { execQuery } = useFaunaQuery();
  const [modalRenameShow, setModalRenameShow] = useState<boolean>(false);
  const [serchUserAndShare, setSerchUserAndShare] = useState<boolean>(false);
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

  return (
    <div key={model.id}>
      {modalRenameShow && (
        <RenameModal setRenameModalShow={setModalRenameShow} model={model} />
      )}
      {serchUserAndShare && (
        <SearchUserAndShare
          setShowSearchUser={setSerchUserAndShare}
          modelToShare={model}
        />
      )}
      <div
        className="px-10 py-12 relative rounded-xl border border-black flex flex-col items-center hover:bg-black hover:text-white hover:cursor-pointer hover:shadow-2xl"
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
        // onContextMenu={handleContextMenu}
      >
        <GiCubeforce size={75} />
        <span className="absolute bottom-2 font-semibold">{model.name}</span>
      </div>
      {/* <Menu id={model.components}>
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
        <Item
          onClick={(e) => {
            e.event.preventDefault();
            setSerchUserAndShare(true);
          }}
        >
          <div className="flex w-full flex-row justify-between items-center">
            <span>Share With</span>
            <BiSolidShare size={20} />
          </div>
        </Item>
        <Separator />
        <Item
          onClick={(e) => {
            e.event.preventDefault();
            // eslint-disable-next-line no-restricted-globals
            const conf = confirm(`Are you sure to delete model ${model.name}?`);
            if (conf) {
              deleteFileS3(model.components)
                .then(() => {
                  // cancellare documento fauna
                  execQuery(deleteFaunadbModel, model.id as string)
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
          <div className="flex w-full flex-row justify-between items-center">
            <span>Delete</span>
            <BiSolidTrash size={20} />
          </div>
        </Item>
      </Menu> */}
    </div>
  );
};

export default MySharedProject;
