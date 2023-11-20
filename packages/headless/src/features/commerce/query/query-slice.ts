import {createReducer} from '../../../ssr.index';
import {updateQuery} from './query-actions';
import {getCommerceQueryInitialState} from './query-state';

export const queryReducer = createReducer(
  getCommerceQueryInitialState(),

  (builder) => {
    builder.addCase(updateQuery, (state, action) => ({
      ...state,
      ...action.payload,
    }));
  }
);