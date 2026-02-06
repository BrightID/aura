import CustomTrans from 'components/CustomTrans';

import { AnimatedText, FadeIn, MoveUpIn, MoveX } from 'components/animations';

const FourthStep = () => {
  return (
    <>
      <span className="flex items-start gap-4 mb-3 pl-5 pr-12">
        <p className="text-white text-5xl font-black">4</p>
        <p className="text-pastel-purple text-3xl font-black">
          <CustomTrans i18nKey="playerOnboarding.step4.title" />
        </p>
      </span>
      <p className="text-white font-medium text-lg pl-5 pr-7 mb-6">
        <CustomTrans i18nKey="playerOnboarding.step4.description" />
      </p>

      <section className="relative flex flex-col items-center gap-4 justify-center w-fit mx-auto mb-3">
        <MoveUpIn delay={0.1} y={10}>
          <img src="/assets/images/onboarding/top-double-arrow.svg" alt="" />
        </MoveUpIn>
        <MoveUpIn delay={0.3} y={10}>
          <div className="flex gap-4 pl-5 pr-4 py-4 rounded-lg bg-white opacity-90">
            <img src="/assets/images/onboarding/profile-img.svg" alt="" />
            <div className="flex flex-col mr-2">
              <p className="font-medium">Sydney Akers</p>
              <div className="flex gap-1 items-center">
                <p className="font-bold text-sm">Level</p>
                <FadeIn delay={0.5} duration={0.2}>
                  <AnimatedText
                    delay={1}
                    duration={0.3}
                    className="text-sm"
                    startWeight={900}
                    endWeight={900}
                    startColor="#A462FF"
                    endColor="#2C2C2C"
                  >
                    1
                  </AnimatedText>
                </FadeIn>
                <MoveX
                  x={-5}
                  opacity={0}
                  delay={0.8}
                  duration={0.3}
                  className="text-pastel-purple"
                >
                  <img src="/assets/images/onboarding/right-arrow.svg" alt="" />
                </MoveX>
                <FadeIn delay={1.1} duration={0.2}>
                  <AnimatedText
                    delay={2}
                    duration={0.3}
                    className="text-sm"
                    startWeight={900}
                    endWeight={900}
                    startColor="#A462FF"
                    endColor="#2C2C2C"
                  >
                    2
                  </AnimatedText>
                </FadeIn>
                <MoveX
                  x={-5}
                  opacity={0}
                  delay={1.8}
                  duration={0.3}
                  className="text-pastel-purple"
                >
                  <img src="/assets/images/onboarding/right-arrow.svg" alt="" />
                </MoveX>
                <FadeIn
                  delay={2.1}
                  duration={0.3}
                  className="text-pastel-purple font-bold text-sm"
                >
                  3
                </FadeIn>
              </div>
            </div>
            <img src="/assets/images/onboarding/profile-info.svg" alt="" />
          </div>
        </MoveUpIn>
      </section>
    </>
  );
};

export default FourthStep;
