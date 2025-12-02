import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionCreators } from 'redux-undo';
import { AiOutlineAppstoreAdd } from 'react-icons/ai';
import Navbar from './components/navbar/Navbar';
import 'react-contexify/ReactContexify.css';
import MyProject from './components/myProjects/MyProject';
import {
  addModel,
  ModelsSelector,
  removeModel,
  resetModel,
} from '../store/modelSlice';
import { resetState } from '../../cad_library';
import { ThemeSelector } from '../../esymia/store/tabsAndMenuItemsSlice';
import { useDynamoDBQuery } from '../../dynamoDB/hook/useDynamoDBQuery';
import { getModelsByOwnerDynamoDB } from '../../dynamoDB/modelsApis';
import { convertFromDynamoDBFormat } from '../../dynamoDB/utility/formatDynamoDBData';
import { DynamoDBCadModel } from '../../cad_library/components/dynamodb/api/modelsAPIs';

export interface DashboardProps {
  showCad: boolean;
  setShowCad: (v: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ showCad, setShowCad }) => {
  const { user } = useAuth0();
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>('MP');
  const models = useSelector(ModelsSelector);
  const theme = useSelector(ThemeSelector);
  const isDark = theme !== 'light';
  const dispatch = useDispatch();

  const deleteModel = (model: DynamoDBCadModel) => {
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
          if (res.Items) {
            res.Items.forEach((i: any) => dispatch(addModel(convertFromDynamoDBFormat(i))))
          }
        })
        .catch((err) => console.log(err));
    }
  }, [user, showCad, selectedMenuItem]);

  return (
    <div className='flex flex-col h-full'>
      {/* Optional: Keep Navbar if it has functionality, or replace with a simple header if it's just a title */}
      {/* <Navbar
        selectedMenuItem={selectedMenuItem}
        setSelectedMenuItem={setSelectedMenuItem}
      /> */}

      {user && (
        <div className='w-full flex-1 overflow-y-auto p-4'>
          {selectedMenuItem === 'MP' && (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
              {/* New Project Button */}
              <button
                className={`group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all duration-300 hover:shadow-xl ${isDark
                  ? 'border-gray-600 hover:border-blue-500 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-blue-400'
                  : 'border-gray-300 hover:border-blue-500 bg-white/40 hover:bg-white/60 text-gray-500 hover:text-blue-600'
                  } ${models.length === 3 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => {
                  dispatch(resetState());
                  dispatch(ActionCreators.clearHistory());
                  setShowCad(true);
                }}
                disabled={models.length === 3}
              >
                <div className="p-4 rounded-full bg-transparent group-hover:scale-110 transition-transform duration-300">
                  <AiOutlineAppstoreAdd size={48} />
                </div>
                <span className='mt-4 font-semibold text-lg'>New Blank Project</span>
                {models.length === 3 && <span className="text-xs mt-2 text-red-400">Limit reached (3)</span>}
              </button>

              {/* Existing Projects */}
              {models.map((m) => {
                return (
                  <MyProject
                    key={m.id}
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
  );
};

export default Dashboard;
