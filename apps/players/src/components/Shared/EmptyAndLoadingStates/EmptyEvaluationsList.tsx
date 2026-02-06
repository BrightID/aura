import { Button } from '@/components/ui/button';
import useViewMode from '@/hooks/useViewMode';
import { toTitleCase } from '@/utils/text';
import { FaSearch } from 'react-icons/fa';
import { Link } from 'react-router';

export const EmptyEvaluationsList = ({
  clearFilter,
  hasFilter,
  searchString,
}: {
  clearFilter: () => void;
  hasFilter: boolean;
  searchString?: string;
}) => {
  const { currentRoleEvaluatorEvaluationCategory } = useViewMode();

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-2 py-10">
      <img
        src="/assets/images/Shared/no-evidence-found.svg"
        alt="Empty State"
        className="h-8 w-10"
      />
      <h2 className="text-lg font-medium text-white">
        No {toTitleCase(currentRoleEvaluatorEvaluationCategory)}s found
      </h2>
      {hasFilter && (
        <p
          className="cursor-pointer text-center text-white underline"
          onClick={clearFilter}
        >
          Reset view to default
        </p>
      )}
      {!!searchString && (
        <Link to={`/home?search=${searchString}&tab=evaluate`}>
          <Button variant="link" className="text-blue">
            <FaSearch />
            Search in your connections instead
          </Button>
        </Link>
      )}
    </div>
  );
};
