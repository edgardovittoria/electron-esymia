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
  resetModel,
  setSharedModel,
  SharedModelsSelector
} from '../store/modelSlice';
import { getSharedModels } from '../faunaDB/functions';
import { useFaunaQuery } from '../../esymia/faunadb/hook/useFaunaQuery';
import { Client, fql, QuerySuccess } from 'fauna';
import { FaunaCadModel, resetState } from '../../cad_library';
import { ThemeSelector } from '../../esymia/store/tabsAndMenuItemsSlice';
import { useDynamoDBQuery } from '../../dynamoDB/hook/useDynamoDBQuery';
import { getModelsByOwnerDynamoDB } from '../../dynamoDB/modelsApis';
import { convertFromDynamoDBFormat } from '../../dynamoDB/utility/formatDynamoDBData';

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
  const theme = useSelector(ThemeSelector)
  const dispatch = useDispatch();
  const deleteModel = (model: FaunaCadModel) => {
    // setModels(models.filter((m) => m.id !== model.id));
    if (model.id) {
      dispatch(removeModel(model.id));
    }
  };
  const { execQuery2 } = useDynamoDBQuery();
  useEffect(() => {
    if (user && user.sub) {
      execQuery2(getModelsByOwnerDynamoDB, user.sub, dispatch)
        .then((res) => {
          dispatch(resetModel())
          if(res.Items){
            res.Items.forEach((i: any) => dispatch(addModel(convertFromDynamoDBFormat(i))))
          }
        })
        .catch((err) => console.log(err));
    }
  }, [user, showCad, selectedMenuItem]);

  return (
    <div className='flex flex-col'>
      <Navbar
        selectedMenuItem={selectedMenuItem}
        setSelectedMenuItem={setSelectedMenuItem}
      />
      {user && (
        <div className='w-full h-[97vh] flex items-start pt-10 relative'>
          {selectedMenuItem === 'MP' && (
            <div className='w-full px-10 grid grid-cols-6 gap-4'>
              {models.map((m) => {
                return (
                  <MyProject
                    model={m}
                    setShowCad={setShowCad}
                    deleteModel={deleteModel}
                  />
                );
              })}
              <button
                className={`px-10 py-12 relative rounded-xl border ${theme === 'light' ? 'border-textColor text-textColor hover:bg-secondaryColor hover:text-white' : 'border-textColorDark text-textColorDark hover:bg-secondaryColorDark hover:text-textColor'}  flex flex-col items-center hover:cursor-pointer hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-textColor disabled:hover:bg-transparent`}
                onClick={() => {
                  dispatch(resetState());
                  dispatch(ActionCreators.clearHistory());
                  setShowCad(true);
                }}
                disabled={models.length === 3}
              >
                <AiOutlineAppstoreAdd size={75} />
                <span className='absolute bottom-2 font-semibold'>
                  New Blank Project
                </span>
              </button>
            </div>
          )}
        </div>
      )
      }
    </div>
  );
};

export default Dashboard;
