import { createContext } from "react";

export const CustomMenuContext = createContext({
  hidden: true,
  items: [],
  toggleMenu: () => {}
});

