import { Link } from 'react-router-dom';
import { BsTwitterX } from 'react-icons/bs';
import { FaDiscord } from 'react-icons/fa';
import { SiGitbook } from 'react-icons/si';
import DefaultHeader from '@/components/Header/DefaultHeader';

export default function NotFoundPage() {
  return (
    <>
      <DefaultHeader title="404 - Page Not Found" />
      <div className="page flex w-full flex-1 flex-col items-center justify-center gap-6 pt-10 text-center dark:text-white">
        <h1 className="text-4xl font-bold">404</h1>
        <h1 className="text-3xl font-bold">Oops! Page not found.</h1>
        <p className="text-lg text-gray-500 dark:text-gray-300">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/home"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Go back home
        </Link>

        <div className="mt-10 flex flex-col items-center gap-4">
          <a
            target="_blank"
            href="https://brightid.gitbook.io/aura"
            rel="noreferrer"
          >
            <SiGitbook size={24} />
          </a>
          <a
            target="_blank"
            href="https://discord.gg/y24xeXq7mj"
            rel="noreferrer"
          >
            <FaDiscord size={24} />
          </a>
          <a
            target="_blank"
            href="https://x.com/brightidproject"
            rel="noreferrer"
          >
            <BsTwitterX size={24} />
          </a>
        </div>
      </div>
    </>
  );
}
