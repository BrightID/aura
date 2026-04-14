import { SiGitbook } from 'react-icons/si';
import { Link } from 'react-router';

import {
  ratingToText,
  subjectRatingColorMap,
  userRatingColorMap,
  valueColorMap,
} from '@/constants/chart';

export default function ChartViewHelpModal() {
  return (
    <div className="leading-loose no-scrollbar text-base max-h-96 overflow-y-auto">
      <Link
        className="text-sm flex items-center gap-4"
        target="_blank"
        to="https://brightid.gitbook.io/aura/evidence/impact-bar-chart"
      >
        <SiGitbook /> Gitbook
      </Link>
      <p className="mt-5">
        The Overview tab provides a summary of the user{"'"}s evaluation
        performance and impact. It offers a quick glance at key metrics, making
        it easier for viewers to understand the user{"'"}s contributions and
        credibility.
      </p>

      <h5 className="font-semibold text-lg mt-5">Chart Evaluation Colors</h5>
      <hr className="my-5" />
      <h5 className="font-semibold">User Evaluation Colors</h5>
      <div className="flex flex-col mt-2 gap-2">
        {Object.keys(valueColorMap).map((item, key) => (
          <div className="flex items-center gap-5" key={key}>
            <div
              className="w-32 h-4 rounded-lg"
              style={{ backgroundColor: (valueColorMap as any)[item] }}
            ></div>
            {item} <strong>{ratingToText[item]}</strong>
          </div>
        ))}
      </div>
      <hr className="my-5" />
      <h5 className="font-semibold">Your Evaluation Colors</h5>
      <div className="flex flex-col mt-2 gap-2">
        {Object.keys(userRatingColorMap).map((item, key) => (
          <div className="flex items-center gap-5" key={key}>
            <div
              className="w-32 h-4 rounded-lg"
              style={{ backgroundColor: (userRatingColorMap as any)[item] }}
            ></div>
            {item} <strong>{ratingToText[item]}</strong>
          </div>
        ))}
      </div>
      <hr className="my-5" />
      <h5 className="font-semibold">Current Subject Evaluation Colors</h5>
      <div className="flex flex-col mt-2 gap-2">
        {Object.keys(subjectRatingColorMap).map((item, key) => (
          <div className="flex items-center gap-5" key={key}>
            <div
              className="w-32 h-4 rounded-lg"
              style={{ backgroundColor: (subjectRatingColorMap as any)[item] }}
            ></div>
            {item} <strong>{ratingToText[item]}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
