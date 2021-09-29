import {buildController} from '../../../controller/headless-controller';
import {
  RangeFacetResponse,
  RangeFacetRequest,
} from '../../../../features/facets/range-facets/generic/interfaces/range-facet';
import {
  baseFacetResponseSelector,
  isFacetLoadingResponseSelector,
} from '../../../../features/facets/facet-set/facet-set-selectors';
import {RangeFacetSortCriterion} from '../../../../features/facets/range-facets/generic/interfaces/request';
import {updateRangeFacetSortCriterion} from '../../../../features/facets/range-facets/generic/range-facet-actions';
import {deselectAllFacetValues} from '../../../../features/facets/facet-set/facet-set-actions';
import {updateFacetOptions} from '../../../../features/facet-options/facet-options-actions';
import {
  ConfigurationSection,
  SearchSection,
} from '../../../../state/state-sections';
import {isRangeFacetValueSelected} from '../../../../features/facets/range-facets/generic/range-facet-utils';
import {CoreEngine} from '../../../../app/engine';

export type RangeFacet = ReturnType<typeof buildCoreRangeFacet>;

export type RangeFacetProps<T extends RangeFacetRequest> = {
  facetId: string;
  getRequest: () => T;
};

export function buildCoreRangeFacet<
  T extends RangeFacetRequest,
  R extends RangeFacetResponse
>(
  engine: CoreEngine<ConfigurationSection & SearchSection>,
  props: RangeFacetProps<T>
) {
  type RangeFacetValue = R['values'][0];

  const {facetId, getRequest} = props;
  const controller = buildController(engine);
  const dispatch = engine.dispatch;

  return {
    ...controller,

    isValueSelected: isRangeFacetValueSelected,

    deselectAll() {
      dispatch(deselectAllFacetValues(facetId));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
    },

    sortBy(criterion: RangeFacetSortCriterion) {
      dispatch(updateRangeFacetSortCriterion({facetId, criterion}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
    },

    isSortedBy(criterion: RangeFacetSortCriterion) {
      return this.state.sortCriterion === criterion;
    },

    get state() {
      const request = getRequest();
      const response = baseFacetResponseSelector(engine.state, facetId) as
        | R
        | undefined;

      const sortCriterion = request.sortCriteria;
      const values: R['values'] = response ? response.values : [];
      const isLoading = isFacetLoadingResponseSelector(engine.state);
      const hasActiveValues = values.some(
        (facetValue: RangeFacetValue) => facetValue.state !== 'idle'
      );

      return {
        facetId,
        values,
        sortCriterion,
        hasActiveValues,
        isLoading,
      };
    },
  };
}

interface AssertRangeFacetOptions {
  generateAutomaticRanges: boolean;
  currentValues?: unknown[];
}

export function assertRangeFacetOptions(
  options: AssertRangeFacetOptions,
  controllerName: 'buildNumericFacet' | 'buildDateFacet'
) {
  if (!options.generateAutomaticRanges && options.currentValues === undefined) {
    const message = `currentValues should be specified for ${controllerName} when generateAutomaticRanges is false.`;
    throw new Error(message);
  }
}