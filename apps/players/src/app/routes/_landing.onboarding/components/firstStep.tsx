import CustomTrans from 'components/CustomTrans';

import { MoveUpIn } from 'components/animations';

const FirstStep = () => {
  return (
    <>
      <span className="flex items-start gap-4 mb-3 pl-5 pr-12">
        <p className="text-white text-5xl font-black">1</p>
        <p className="text-pastel-purple text-3xl font-black">
          <CustomTrans i18nKey="playerOnboarding.step1.title" />
        </p>
      </span>
      <p className="text-white font-medium text-lg mb-9 pl-5 pr-7">
        <CustomTrans i18nKey="playerOnboarding.step1.description" />
      </p>

      <div className="content-images relative flex w-full justify-center">
        <MoveUpIn duration={0.3} delay={0.3} y={5}>
          <img
            src="/assets/images/onboarding/subject-card-1.svg"
            alt=""
            className="top-0 absolute w-[50vw] max-w-[170px] left-1/2 -translate-x-1/2"
          />
        </MoveUpIn>
        <MoveUpIn duration={0.35} delay={0.3} y={-10}>
          <img
            src="/assets/images/onboarding/subject-card-2.svg"
            alt=""
            className="top-6 absolute w-[75vw] max-w-[250px] left-1/2 -translate-x-1/2"
          />
        </MoveUpIn>
        <MoveUpIn duration={0.4} delay={0.3} y={-30}>
          <img
            src="/assets/images/onboarding/subject-card-3.svg"
            alt=""
            className="top-14 absolute w-[90vw] max-w-[385px] left-1/2 -translate-x-1/2"
          />
        </MoveUpIn>
      </div>
    </>
  );
};

export default FirstStep;
