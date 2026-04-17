// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

import { SUBJECTS_EVALUATION_ONBOARDING_GUIDE_STEP_COUNT } from '@/constants/index';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useProfileStore } from '@/store/profile.store';
import { A11y, Navigation, Pagination, Scrollbar } from 'swiper/modules';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import { RoutePath } from 'types/router';

import FirstStep from './components/firstStep';
import FourthStep from './components/fourthStep';
import SecondStep from './components/secondStep';
import ThirdStep from './components/thirdStep';

const Onboarding = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const stepNumber = Number(searchParams.get('step')) || 1;
  const navigate = useNavigate();
  const setPlayerOnboardingScreenShown = useProfileStore((s) => s.setPlayerOnboardingScreenShown);

  const swiperRef = useRef<SwiperRef>(null);

  useEffect(() => {
    if (!stepNumber) {
      setSearchParams({ step: '1' });
    }
  }, [setSearchParams, stepNumber]);

  const handleSlideChange = (swiper: any) => {
    setSearchParams({ step: (swiper.activeIndex + 1).toString() });
  };

  const handleFinish = () => {
    setPlayerOnboardingScreenShown(true);
    navigate(RoutePath.HOME);
  };

  return (
    <div
      className="page flex min-h-screen flex-col !px-[22px] !pt-[30px] pb-4"
      data-testid="subjects-evaluation-onboarding-guide"
    >
      <section
        className="content"
        data-testid={`subjects-evaluation-onboarding-guide-step-${stepNumber}`}
      >
        <Swiper
          modules={[Navigation, Pagination, Scrollbar, A11y]}
          spaceBetween={50}
          slidesPerView={1}
          onSlideChange={handleSlideChange}
          ref={swiperRef}
          initialSlide={stepNumber - 1}
        >
          <SwiperSlide>
            <FirstStep />
          </SwiperSlide>
          <SwiperSlide>
            <SecondStep />
          </SwiperSlide>
          <SwiperSlide>
            <ThirdStep />
          </SwiperSlide>
          <SwiperSlide>
            <FourthStep />
          </SwiperSlide>
        </Swiper>
      </section>

      <section className="actions mb-24 mt-auto flex min-h-[56px] w-full items-center justify-between px-5 text-center">
        <div className="step-anotators flex gap-2">
          {[1, 2, 3, 4].map((step) => (
            <span
              key={step}
              onClick={() => {
                setSearchParams({ step: step.toString() });
                swiperRef.current?.swiper.slideTo(step - 1);
              }}
              className={`h-2.5 w-2.5 cursor-pointer rounded-full bg-white transition-all ${
                stepNumber === step && '!w-10 !bg-pastel-purple'
              }`}
            ></span>
          ))}
        </div>
        <button
          onClick={() => {
            if (stepNumber < SUBJECTS_EVALUATION_ONBOARDING_GUIDE_STEP_COUNT) {
              setSearchParams({ step: (stepNumber + 1).toString() });
              swiperRef.current?.swiper.slideNext();
            } else {
              handleFinish();
            }
          }}
          className={`duration-400 h-10 w-10 rounded-3xl bg-pastel-purple p-3 transition-all ${
            stepNumber === SUBJECTS_EVALUATION_ONBOARDING_GUIDE_STEP_COUNT &&
            '!h-14 !w-[165px] !rounded-xl'
          }`}
        >
          {stepNumber < SUBJECTS_EVALUATION_ONBOARDING_GUIDE_STEP_COUNT ? (
            <img
              src="/assets/images/Shared/next-page.svg"
              data-testid="subjects-evaluation-onboarding-guide-next-button"
              className="opacity-1 h-4 w-4 translate-x-[1px] transition-all"
              alt=""
            />
          ) : (
            <p
              data-testid="subjects-evaluation-onboarding-guide-finish-button"
              className="opacity-1 text-xl font-semibold text-white transition-all"
            >
              Let&apos;s Start
            </p>
          )}
        </button>
      </section>

      <footer className="flex justify-between text-sm text-gray90">
        <span className="flex gap-1"></span>
        <span className="flex gap-1">
          <p className="text-gray50">Powered by:</p>
          <p className="font-light">BrightID</p>
        </span>
      </footer>
    </div>
  );
};

export default Onboarding;
