import { useDispatch } from 'store/hooks';
import { setSplashScreenShown } from 'store/profile';

import { FadeIn, Scale } from 'components/animations';
import CustomTrans from 'components/CustomTrans';

const Spalsh = () => {
  const dispatch = useDispatch();
  return (
    <div className="page flex min-h-screen flex-col !px-[22px] !pt-[90px] pb-4">
      <section className="content pl-5 pr-12">
        <FadeIn delay={0.1}>
          <p
            data-testid="login-title"
            className="mb-3 text-5xl font-black text-white"
          >
            Aura
          </p>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="mb-9 text-2xl font-black text-white">
            <CustomTrans i18nKey="welcomeScreen.tagline" />
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-lg font-medium text-white">
            <CustomTrans i18nKey="welcomeScreen.description" />
          </p>
        </FadeIn>
      </section>

      <section className="actions mb-24 mt-auto text-center">
        <Scale delay={0.25}>
          <button
            className="btn btn--big w-full max-w-[270px] !text-white"
            data-testid="splash-dismiss-btn"
            onClick={() => dispatch(setSplashScreenShown(true))}
          >
            Get Started
          </button>
        </Scale>
      </section>
      <FadeIn delay={0.3}>
        <footer className="flex justify-between text-sm text-gray90">
          <span className="flex gap-1">
            {/* <p className="font-light">Version</p>
            <p className="">2.1</p> */}
          </span>
          <span className="flex gap-1">
            <p className="text-gray50">Powered by:</p>
            <p className="font-light">BrightID</p>
          </span>
        </footer>
      </FadeIn>
    </div>
  );
};

export default Spalsh;
