import { useDispatch } from "react-redux";
import { setMessageInfoModal, setIsAlertInfoModal, setShowInfoModal } from "../../../store/tabsAndMenuItemsSlice";

export const useDynamoDBQuery = () => {
  const dispatch = useDispatch()
    const execQuery2 = async (queryFunction: (...params: any) => Promise<any>, ...queryParams: any) => {
      try {
        return queryFunction(...queryParams)
      } catch (error) {
        console.log(error)
        dispatch(
          setMessageInfoModal(
            'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
          ),
        );
        dispatch(setIsAlertInfoModal(false));
        dispatch(setShowInfoModal(true));
        return null
      }
    }
    return { execQuery2 }
  }