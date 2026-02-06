import { Link } from 'react-router';

const DomainOverview = () => {
  return (
    <div className="page">
      <div className="row mb-4">
        <div className="card">
          <span className="row">
            <span className="flex-1">
              <p className="text-sm">Domain</p>
              <p className="mb-2.5 font-bold">BrightID</p>
            </span>
            <span className="flex-1">
              <p className="text-sm">Creator</p>
              <p className="mb-2.5 flex font-bold">
                Sina.eth
                <img
                  className="ml-1"
                  src="/assets/images/DomainOverview/link-icon.svg"
                  alt=""
                />
              </p>
            </span>
            <span className="flex-1">
              <p className="text-sm">Created at</p>
              <p className="mb-2.5 font-bold">23 May 03</p>
            </span>
          </span>
          <span className="row">
            <span className="flex-1">
              <p className="text-sm">#Energy teams</p>
              <p className="mb-2.5 font-bold">3</p>
            </span>
            <span className="flex-1">
              <p className="text-sm">Current team</p>
              <p className="mb-2.5 font-bold">Core</p>
            </span>
            <span className="flex-1">
              <button className="btn">Change</button>
            </span>
          </span>
          <p className="text-sm">About</p>
          <p className="text-sm font-bold">
            BrightID is a digital identity solution that aims to revolutionize
            how identities are verified online
          </p>
        </div>
      </div>

      <div className="row mb-4">
        <Link to="/domain-overview" className="card">
          <div className="row">
            <img
              className="icon"
              src="/assets/images/DomainOverview/subjects-icon.svg"
              alt=""
            />
            <p className="font-bold text-gray20">1203</p>
          </div>
          <p className="text-right text-[18px] text-gray20">Subjects</p>
        </Link>
        <Link to="/domain-overview" className="card">
          <div className="row">
            <img
              className="icon"
              src="/assets/images/DomainOverview/players-icon.svg"
              alt=""
            />
            <p className="font-bold text-gray20">247</p>
          </div>
          <p className="text-right text-[18px] text-gray20">Players</p>
        </Link>
      </div>

      <div className="row mb-4">
        <Link to="/domain-overview" className="card">
          <div className="row">
            <img
              className="icon"
              src="/assets/images/DomainOverview/trainers-icon.svg"
              alt=""
            />
            <p className="font-bold text-gray20">11</p>
          </div>
          <p className="text-right text-[18px] text-gray20">Trainers</p>
        </Link>
        <Link to="/domain-overview" className="card">
          <div className="row">
            <img
              className="icon"
              src="/assets/images/DomainOverview/managers-icon.svg"
              alt=""
            />
            <p className="font-bold text-gray20">3</p>
          </div>
          <p className="text-right text-[18px] text-gray20">Managers</p>
        </Link>
      </div>
    </div>
  );
};

export default DomainOverview;
