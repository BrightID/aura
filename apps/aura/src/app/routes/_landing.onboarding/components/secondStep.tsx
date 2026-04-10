import CustomTrans from 'components/CustomTrans';
import { useState } from 'react';

import { BookOpen, FadeIn, Scale } from 'components/animations';

const SecondStep = () => {
  const [selectedCard, setSelectedCard] = useState(0);
  const [showConnectedToInfo, setShowConnectedToInfo] = useState(false);
  const [showEvaluatedInfo, setShowEvaluatedInfo] = useState(false);

  return (
    <>
      <span className="flex items-start gap-4 mb-3 pl-5 pr-12">
        <p className="text-white text-5xl font-black">2</p>
        <p className="text-pastel-purple text-3xl font-black">
          <CustomTrans i18nKey="playerOnboarding.step2.title" />
        </p>
      </span>
      <p className="text-white font-medium text-lg pl-5 pr-7 mb-9">
        <CustomTrans i18nKey="playerOnboarding.step2.description" />
      </p>

      <section className="step-content flex flex-col mx-auto gap-3 min-h-[360px]">
        <FadeIn delay={0.2}>
          <img
            className="w-[65%] min-w-[250px] mx-auto"
            src="/assets/images/onboarding/profile-card.svg"
            alt="step2"
          />
        </FadeIn>
        <FadeIn delay={0.3}>
          <span>
            <img
              onClick={() => {
                selectedCard === 0 ? setSelectedCard(1) : setSelectedCard(0);
                if (selectedCard === 0) {
                  setTimeout(() => {
                    setShowEvaluatedInfo(true);
                  }, 100);
                } else {
                  setShowEvaluatedInfo(false);
                }
              }}
              className={`w-[67%] h-[100px] min-w-[250px] cursor-pointer -translate-x-[20%] mx-auto transition-all duration-300 ${selectedCard === 1
                ? 'opacity-100 h-[134px] !w-full !translate-x-0'
                : selectedCard === 2
                  ? '!h-0 opacity-0'
                  : 'opacity-50'
                }`}
              src="/assets/images/onboarding/evaluated-card.svg"
              alt="step2"
            />
            {showEvaluatedInfo && (
              <FadeIn
                delay={0.2}
                duration={0.1}
                className="relative mx-auto max-w-[300px] w-[86%] flex gap-2 mt-2"
              >
                <BookOpen
                  delay={0.3}
                  orientation="vertical"
                  className="absolute -top-2 left-1"
                  size={16}
                >
                  <div
                    className={'h-4 border-r-2 border-dashed border-purple2'}
                  ></div>
                </BookOpen>
                <Scale scale={1} delay={0.1}>
                  <div className="w-2.5 h-2.5 mt-[7px] bg-purple2 rounded-full"></div>
                </Scale>
                <FadeIn delay={0.3} className="text-white w-full">
                  <p>
                    <span className="text-purple2">Evaluation </span>
                    <CustomTrans i18nKey="playerOnboarding.step2.evaluationCardDescription" />
                  </p>
                </FadeIn>
              </FadeIn>
            )}
          </span>
        </FadeIn>
        <FadeIn delay={0.4}>
          <img
            onClick={() => {
              selectedCard === 0 ? setSelectedCard(2) : setSelectedCard(0);
              if (selectedCard === 0) {
                setTimeout(() => {
                  setShowConnectedToInfo(true);
                }, 100);
              } else {
                setShowConnectedToInfo(false);
              }
            }}
            className={`w-[67%] h-[100px] min-w-[250px] cursor-pointer mx-auto translate-x-[20%] transition-all duration-300 ${selectedCard === 2
              ? 'opacity-100 h-[134px] !w-full !translate-x-0'
              : selectedCard === 1
                ? '!h-0 opacity-0 !duration-0'
                : 'opacity-50'
              }`}
            src="/assets/images/onboarding/connected-to-card.svg"
            alt="step2"
          />
          {showConnectedToInfo && (
            <FadeIn
              delay={0.2}
              duration={0.1}
              className="relative mx-auto max-w-[300px] w-[86%] flex gap-2 mt-2"
            >
              <BookOpen
                delay={0.3}
                orientation="vertical"
                className="absolute -top-2 left-1"
                size={16}
              >
                <div
                  className={'h-4 border-r-2 border-dashed border-light-orange'}
                ></div>
              </BookOpen>
              <Scale scale={1} delay={0.1}>
                <div className="w-2.5 h-2.5 mt-[7px] bg-light-orange rounded-full"></div>
              </Scale>
              <FadeIn delay={0.3} className="text-white w-full">
                <p>
                  <span className="text-light-orange">Connection </span>
                  <CustomTrans i18nKey="playerOnboarding.step2.connectionCardDescription" />
                </p>
              </FadeIn>
            </FadeIn>
          )}
        </FadeIn>
      </section>
    </>
  );
};

export default SecondStep;
