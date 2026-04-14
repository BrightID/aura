import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';

import { selectAuthData } from 'store/profile/selectors';
import { EvaluationCategory } from 'types/dashboard';

const LinkCard = () => {
  const authData = useSelector(selectAuthData);
  const evaluationLink = useMemo(
    () =>
      `${window.location.origin}/subject/${authData?.brightId}?viewas=${EvaluationCategory.PLAYER}`,
    [authData?.brightId],
  );

  // Function to copy the evaluationLink to the clipboard
  const handleCopyClick = () => {
    navigator.clipboard
      .writeText(evaluationLink)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  // Function to share the evaluationLink using the browser Share API
  const handleShareClick = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Player Evaluation Link',
          text: 'Here is the link to become a player:',
          url: evaluationLink,
        })
        .then(() => console.log('Link shared successfully'))
        .catch((err) => console.error('Error sharing link: ', err));
    } else {
      alert('Share API is not supported in your browser');
    }
  };

  return (
    <div className="card flex w-full flex-col gap-3 dark:bg-dark-primary">
      <p className="font-medium leading-4 text-gray00 dark:text-gray-300">
        Share this link with a trainer to become their player
      </p>
      <div className="flex w-full items-center gap-2.5">
        <div className="min-w-0 flex-grow rounded bg-purple00 bg-opacity-50 px-3 py-2.5">
          <Link
            to={evaluationLink}
            className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-black2 dark:text-gray-100"
          >
            {evaluationLink}
          </Link>
        </div>
        <LinkIcon
          className="flex-shrink-0 flex-grow-0"
          image="/assets/images/Shared/copy-icon.svg"
          onClick={handleCopyClick} // Handle copy
        />
        <LinkIcon
          className="flex-shrink-0 flex-grow-0"
          image="/assets/images/Shared/share-icon.svg"
          onClick={handleShareClick} // Handle share
        />
      </div>
    </div>
  );
};

const LinkIcon = ({
  image,
  className,
  onClick,
}: {
  image: string;
  className?: string;
  onClick: () => void; // Event handler for click action
}) => {
  return (
    <div
      className={`cursor-pointer rounded bg-button-primary p-2 ${className}`}
      onClick={onClick} // Attach click handler
    >
      <img className="h-6 w-6" src={image} alt="" />
    </div>
  );
};

export default LinkCard;
