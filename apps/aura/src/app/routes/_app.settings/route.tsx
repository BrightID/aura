import { BsTwitterX } from 'react-icons/bs';
import { FaDiscord } from 'react-icons/fa';
import { FaHandsHelping } from 'react-icons/fa';
import { MdContactMail, MdOutlineSecurity } from 'react-icons/md';
import { SiGitbook } from 'react-icons/si';
import { Link, useNavigate } from 'react-router';

import { RoutePath } from 'types/router';
import DefaultHeader from '@/components/Header/DefaultHeader';
import VersionCard from './components/version';
import LogoutButton from './components/logout';
import ToggleTheme from './components/theme-toggle';
import SphereComponent from './components/sphere-component';

export default function Settings() {
  const navigate = useNavigate();
  return (
    <>
      <DefaultHeader title="Settings" />
      <div className="page flex w-full flex-1 flex-col gap-4 pt-4 dark:text-white">
        <section className="mt-20 flex w-full flex-col gap-4">
          <Link to="/contact-info">
            <a-card variant="glass" className="flex cursor-pointer items-center gap-2 rounded-lg py-3.5 pl-5 pr-2">
              <MdContactMail size={20} />
              <p className="text-[20px] font-medium">Your Contact info</p>
            </a-card>
          </Link>
          <a-card
            variant="glass"
            className="flex cursor-pointer items-center gap-2 rounded-lg py-3.5 pl-5 pr-2"
            onClick={() => navigate(RoutePath.ROLE_MANAGEMENT)}
          >
            <MdOutlineSecurity size={20} />
            <p className="text-[20px] font-medium">Role Management</p>
          </a-card>
          <Link target="_blank" to="https://brightid.gitbook.io/aura">
            <a-card variant="glass" className="flex cursor-pointer items-center gap-2 rounded-lg py-3.5 pl-5 pr-2">
              <SiGitbook size={20} />
              <p className="text-[20px] font-medium">Aura Guide</p>
            </a-card>
          </Link>

          <ToggleTheme />
          <Link target="_blank" to="https://discord.gg/y24xeXq7mj">
            <a-card variant="glass" className="flex cursor-pointer items-center gap-2 rounded-lg py-3.5 pl-5 pr-5">
              <FaDiscord size={20} className="w-7 cursor-pointer" />
              <p className="text-[20px] font-medium">Discord</p>
            </a-card>
          </Link>

          <Link target="_blank" to="https://x.com/brightidproject">
            <a-card variant="glass" className="flex cursor-pointer items-center justify-between rounded-lg py-3.5 pl-5 pr-5">
              <BsTwitterX size={25} />
            </a-card>
          </Link>
          <a-card
            variant="glass"
            className="flex cursor-pointer items-center gap-2 rounded-lg py-3.5 pl-5 pr-2"
            onClick={() => navigate(`${RoutePath.ONBOARDING}?step=1`)}
          >
            <FaHandsHelping size={20} />
            <p className="text-[20px] font-medium">Onboarding</p>
          </a-card>

          <VersionCard />

          <LogoutButton />
          <SphereComponent />
        </section>
      </div>
    </>
  );
}
