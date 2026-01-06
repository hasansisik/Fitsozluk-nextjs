// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./reducers/userReducer";
import { topicReducer } from "./reducers/topicReducer";

const store = configureStore({
  reducer: {
    user: userReducer,
    topic: topicReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
