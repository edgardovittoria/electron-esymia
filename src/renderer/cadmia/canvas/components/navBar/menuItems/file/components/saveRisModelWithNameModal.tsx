import { useAuth0 } from '@auth0/auth0-react';
import { FC, Fragment, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Transition, Dialog } from '@headlessui/react';
import { unitSelector } from '../../../../statusBar/statusBarSlice';
import { uploadFileS3 } from '../../../../../../aws/crud';
import { addModel, setLoadingSpinner } from '../../../../../../store/modelSlice';
import { setMessageInfoModal, setIsAlertInfoModal, setShowInfoModal } from '../../../../../../../esymia/store/tabsAndMenuItemsSlice';
import { useFaunaQuery } from '../../../../../../../esymia/faunadb/hook/useFaunaQuery';
import { Client, fql, QuerySuccess } from 'fauna';
import { canvasStateSelector, ComponentEntity, CubeGeometryAttributes, FaunaCadModel, Material } from '../../../../../../../cad_library';
import { useDynamoDBQuery } from '../../../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateModelInDynamoDB } from '../../../../../../../dynamoDB/modelsApis';

export const SaveRisModelWithNameModal: FC<{ showModalSave: Function }> = ({
  showModalSave,
}) => {
  const [name, setName] = useState('');
  const { user } = useAuth0();
  const canvas = useSelector(canvasStateSelector);
  const unit = useSelector(unitSelector);
  const { execQuery2 } = useDynamoDBQuery();
  const dispatch = useDispatch();

  const saveModel = async () => {
    const model = JSON.stringify({ components: canvas.components, unit });
    const blobFile = new Blob([model]);
    const modelFile = new File([blobFile], `${name}_model_cadmia.json`, {
      type: 'application/json',
    });
    dispatch(setLoadingSpinner(true))
    const modelRis = JSON.stringify({ bricks: createRisGeometryFrom(canvas.components) });
    const blobFileRis = new Blob([modelRis]);
    const modelFileRis = new File([blobFileRis], `${name}_risGeometry_cadmia.json`, {
      type: 'application/json',
    });
    uploadFileS3(modelFile).then((res) => {
      if (res) {
        uploadFileS3(modelFileRis).then((resRis) => {
          if (resRis) {
            const newModel = {
              id: crypto.randomUUID(),
              name,
              components: res.key,
              bricks: resRis.key,
              owner_id: user?.sub,
              owner: user?.name,
            } as FaunaCadModel;
            execQuery2(createOrUpdateModelInDynamoDB, newModel, dispatch).then((res) => {
              dispatch(addModel(newModel));
              toast.success('Model has been saved!');
              dispatch(setLoadingSpinner(false))
            });
          }
        });
      }
    });
  };

  return (
    <Transition appear show as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => showModalSave(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Save Model to database
                </Dialog.Title>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <label className="ml-2">Name:</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                      className="border border-black rounded shadow p-1 w-[80%] text-black text-left"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-between">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => showModalSave(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={
                      name === ''
                        ? () => {
                            toast.error(
                              'You must insert a valid name for the model.',
                            );
                          }
                        : () => {
                            showModalSave(false);
                            saveModel();
                          }
                    }
                  >
                    Save
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const createRisGeometryFrom = (components: ComponentEntity[]) => {
  let briks: {material: Material, elements: number[][]}[] = []
  components.forEach(c => {
    let coords = [
      c.transformationParams.position[0]-(c.geometryAttributes as CubeGeometryAttributes).width/2,
      c.transformationParams.position[0]+(c.geometryAttributes as CubeGeometryAttributes).width/2,
      c.transformationParams.position[1]-(c.geometryAttributes as CubeGeometryAttributes).height/2,
      c.transformationParams.position[1]+(c.geometryAttributes as CubeGeometryAttributes).height/2,
      c.transformationParams.position[2]-(c.geometryAttributes as CubeGeometryAttributes).depth/2,
      c.transformationParams.position[2]+(c.geometryAttributes as CubeGeometryAttributes).depth/2,
    ]
    if(briks.filter((b) => b.material.name === c.material?.name).length > 0){
      briks.forEach(b => {
        if(b.material.name === c.material?.name){
          b.elements.push(coords)
        }
      })
    }else{
      briks.push({
        material: c.material ? c.material : {} as Material,
        elements: [coords]
      })
    }
  })
  console.log(briks)
  return briks
}
