import { FC } from "react";
import { Checkbox, CheckboxProps } from "../../../../../cad_library/components/utility/checkBox";
import { useDispatch, useSelector } from "react-redux";
import { componentseSelector, setComponentsOpacity } from "../../../../../cad_library";
import { multipleSelectionEntitiesKeysSelector, resetMultipleSelectionEntities, selectAllEntitiesForMultipleSelection } from "../../miscToolbar/miscToolbarSlice";

export const SelectAllCheckBox:FC<CheckboxProps> = ({label}) => {
  const dispatch = useDispatch();
  const components = useSelector(componentseSelector);
  const selectedComponents = useSelector(multipleSelectionEntitiesKeysSelector);
  const toggleSelectAllEntities = (checked: boolean) => {
      let componentsKeys = components.map((c) => c.keyComponent);
      if(checked) {
        dispatch(
          selectAllEntitiesForMultipleSelection(
            componentsKeys,
          ),
        );
        dispatch(
          setComponentsOpacity({
            keys: componentsKeys,
            opacity: 1,
          }),
        );
      }
      else{
        dispatch(resetMultipleSelectionEntities());
        dispatch(
          setComponentsOpacity({
            keys: componentsKeys,
            opacity: 0.3,
          }),
        );
      }
    }
  return <Checkbox label={label} onChange={toggleSelectAllEntities} customCheckedCondition={components.length === selectedComponents.length}/>
}
