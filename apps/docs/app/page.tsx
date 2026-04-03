import Image, { type ImageProps } from "next/image";
import { ReactNode } from "react";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

export default function Home(): ReactNode {
  return (
    <div className="grid min-h-svh grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-20 max-sm:p-8 max-sm:pb-20">
      <main className="row-start-2 flex flex-col gap-8 max-sm:items-center">
        <ThemeImage
          srcLight="turborepo-dark.svg"
          srcDark="turborepo-light.svg"
          alt="Turborepo logo"
          width={180}
          height={38}
          priority
        />
        <ol className="m-0 list-inside p-0 font-[family-name:var(--font-geist-mono)] text-sm leading-6 tracking-tight max-sm:text-center">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 font-[inherit] font-semibold dark:bg-white/10">
              apps/docs/app/page.tsx
            </code>
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className="flex gap-4 max-sm:flex-col">
          <a
            className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent bg-foreground px-5 text-base font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://turborepo.dev/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 min-w-[180px] cursor-pointer items-center justify-center rounded-full border border-black/[0.08] px-5 text-base font-medium transition-colors hover:bg-black/[0.05] dark:border-white/[0.145] dark:hover:bg-white/[0.05] max-sm:min-w-0 max-sm:text-sm"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex flex-wrap items-center justify-center gap-6 font-[family-name:var(--font-geist-sans)]">
        <a
          href="https://vercel.com/templates?search=turborepo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
            className="shrink-0"
          />
          Examples
        </a>
        <a
          href="https://turborepo.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
            className="shrink-0"
          />
          Go to turborepo.dev →
        </a>
      </footer>
    </div>
  );
}
