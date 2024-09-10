import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionCreators } from 'redux-undo';
import { AiOutlineAppstoreAdd } from 'react-icons/ai';
import Navbar from './components/navbar/Navbar';
import 'react-contexify/ReactContexify.css';
import MyProject from './components/myProjects/MyProject';
import boxIcon from '../../../../assets/document-graphic.png';
import {
  addModel,
  ModelsSelector,
  removeModel,
  setSharedModel,
  SharedModelsSelector
} from '../store/modelSlice';
import { getSharedModels } from '../faunaDB/functions';
import MySharedProject from './components/mySharedProjects/MySharedProject';
import { useFaunaQuery } from '../../esymia/faunadb/hook/useFaunaClient';
import { Client, fql, QuerySuccess } from 'fauna';
import { FaunaCadModel, resetState } from '../../cad_library';

const getModelsByOwner = async (faunaClient: Client, faunaQuery: typeof fql, owner_id: string) => {
  try {
      const response = await faunaClient.query(
        faunaQuery`CadModels.models_by_owner(${owner_id})`
      )
          .catch((err: { name: any; message: any; errors: () => { description: any; }[]; }) => console.error(
              'Error: [%s] %s: %s',
              err.name,
              err.message,
              err.errors()[0].description,
          ));
          let res: FaunaModelDetails[] = ((response as QuerySuccess<any>).data.data as any[]).map((item: any) => {return {id: item.id, details: {...item} as FaunaCadModel}})
      return res.map(el => faunaModelDetailsToFaunaCadModel(el))
  } catch (e) {
      console.log(e)
      return {} as [];
  }
}

function faunaModelDetailsToFaunaCadModel(modelDetails: FaunaModelDetails) {
    return {
        id: modelDetails.id,
        ...modelDetails.details
    } as FaunaCadModel
}

type FaunaModelDetails = {
  id: string
  details: FaunaCadModel
}

export interface DashboardProps {
  showCad: boolean;
  setShowCad: (v: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ showCad, setShowCad }) => {
  const { user } = useAuth0();
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>('MP');
  // const [models, setModels] = useState<FaunaCadModel[]>([]);
  const models = useSelector(ModelsSelector);
  const shardeModels = useSelector(SharedModelsSelector);
  const dispatch = useDispatch();
  const deleteModel = (model: FaunaCadModel) => {
    // setModels(models.filter((m) => m.id !== model.id));
    if (model.id) {
      dispatch(removeModel(model.id));
    }
  };
  const { execQuery } = useFaunaQuery();
  useEffect(() => {
    if (user && user.sub) {
      execQuery(getModelsByOwner, user.sub)
        .then((mods) => {
          if (models.length === 0) {
            mods.forEach((m: FaunaCadModel) => dispatch(addModel(m)));
          }
        })
        .catch((err) => console.log(err));
      if (selectedMenuItem === 'MSP') {
        execQuery(getSharedModels, user.email, dispatch)
          .then((mods) => {
            dispatch(setSharedModel(mods));
          })
          .catch((err) => console.log(err));
      }
    }
  }, [user, showCad, selectedMenuItem]);

  return (
    <div className='flex flex-row'>
      <Navbar
        selectedMenuItem={selectedMenuItem}
        setSelectedMenuItem={setSelectedMenuItem}
      />
      {user && (
        <div className='w-full h-[97vh] flex items-start pt-20 relative'>
          {selectedMenuItem === 'MP' && (
            <div className='w-full px-10 grid grid-cols-5 gap-4'>
              {models.map((m) => {
                return (
                  <MyProject
                    model={m}
                    setShowCad={setShowCad}
                    deleteModel={deleteModel}
                  />
                );
              })}
              <div
                className='px-10 py-12 relative rounded-xl border border-dashed border-black flex flex-col items-center hover:bg-secondaryColor hover:text-white hover:cursor-pointer hover:shadow-2xl'
                onClick={() => {
                  dispatch(resetState());
                  dispatch(ActionCreators.clearHistory());
                  setShowCad(true);
                }}
              >
                <AiOutlineAppstoreAdd size={75} />
                <span className='absolute bottom-2 font-semibold'>
                  New Blank Project
                </span>
              </div>
            </div>
          )}
          {selectedMenuItem === 'MSP' && (
            <div
              className={`w-full flex ${shardeModels.length > 0 ? 'items-start' : 'justify-center items-center'}  relative`}>
              {shardeModels.length === 0 ? (
                <div className='flex flex-col justify-center items-center gap-3'>
                  <img src={boxIcon} alt='box icon' />
                  <span className='text-xl font-semibold'>
                    No Shared Projects
                  </span>
                </div>
              ) : (
                <div className='w-full px-10 items-start grid grid-cols-5 gap-4'>
                  {shardeModels.map((m) => {
                    return (
                      <MySharedProject
                        model={m}
                        setShowCad={setShowCad}
                        deleteModel={deleteModel}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )
      }
    </div>
  );
};

export default Dashboard;
