import { Outlet } from "react-router-dom";
import Header from "./components/block/Header";

export default function Layout() {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  )
}
