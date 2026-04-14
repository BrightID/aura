import { Button } from '@/components/ui/button';
import { FaSearch } from 'react-icons/fa';
import { Link } from 'react-router';

export const EmptySubjectList = ({
  clearSortAndFilter,
  hasFilter,
  searchString,
  showConnectionGuide,
}: {
  clearSortAndFilter: () => void;
  hasFilter: boolean;
  showConnectionGuide?: boolean;
  searchString?: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-2 py-10">
      <img
        src="/assets/images/Shared/no-evidence-found.svg"
        alt="Empty State"
        className="h-8 w-10"
      />
      <h2
        data-testid="subject-list-no-result-text"
        className="text-lg font-medium"
      >
        No subjects found
      </h2>
      <p className="text-center">
        {hasFilter ? (
          <span
            className="cursor-pointer underline"
            onClick={clearSortAndFilter}
          >
            Reset view to default
          </span>
        ) : (
          showConnectionGuide && (
            <>
              Open the{' '}
              <span className="cursor-pointer text-bright-l1 hover:underline">
                BrightID
              </span>{' '}
              app to connect with someone. After connecting, you&apos;ll be able
              to evaluate them here
            </>
          )
        )}
      </p>
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
