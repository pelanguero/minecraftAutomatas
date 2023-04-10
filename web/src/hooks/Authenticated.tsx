import { State } from "@/state";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export const Authenticated = () => {
  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { loged } = configurationState

  return loged ? <Outlet /> : <Navigate to="/login" />;
}

