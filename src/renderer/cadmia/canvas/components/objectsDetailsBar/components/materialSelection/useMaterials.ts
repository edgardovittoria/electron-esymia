import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch } from 'react-redux';
import { Material } from '../../../../../../cad_library';
import { useDynamoDBQuery } from '../../../../../../dynamoDB/hook/useDynamoDBQuery';
import { getMaterialsDynamoDB } from '../../../../../../dynamoDB/MaterialsApis';
import { convertFromDynamoDBFormat } from '../../../../../../dynamoDB/utility/formatDynamoDBData';

export const useMaterials = () => {
  const { user } = useAuth0();
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const { execQuery2 } = useDynamoDBQuery();
  const dispatch = useDispatch();
  //TODO: sostituirte user.name con user.email nella versione integrale
  const updateMaterials = () => {
    execQuery2(getMaterialsDynamoDB, dispatch, user?.name as string)?.then((res) => {
      let items: any[] = [];
      if (res.Items) {
        res.Items.forEach((i: any) => items.push(convertFromDynamoDBFormat(i)));
      }
      setAvailableMaterials(items as Material[]);
    });
  };

  useEffect(() => {
    user &&
      execQuery2(getMaterialsDynamoDB, dispatch, user?.name as string)?.then((res) => {
        let items: any[] = [];
        if (res.Items) {
          res.Items.forEach((i: any) =>
            items.push(convertFromDynamoDBFormat(i)),
          );
        }
        setAvailableMaterials(items as Material[]);
      });
  }, []);

  return { availableMaterials, updateMaterials };
};
