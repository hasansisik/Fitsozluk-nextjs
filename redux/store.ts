// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./reducers/userReducer";
import { menuReducer } from "./reducers/menuReducer";
import { topicReducer } from "./reducers/topicReducer";
import { entryReducer } from "./reducers/entryReducer";
import { adReducer } from "./reducers/adReducer";

const store = configureStore({
  reducer: {
    user: userReducer,
    menu: menuReducer,
    topic: topicReducer,
    entry: entryReducer,
    ad: adReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
