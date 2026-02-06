export type PaginationProps = {
  pages: number;
  activePage: number;
  setPageNumber: (arg: number) => void;
};

export default function StepsPagination({
  activePage,
  pages,
  setPageNumber,
}: PaginationProps) {
  return (
    <section className="actions px-5 flex justify-between items-center w-full text-center">
      <div className="step-anotators flex gap-2">
        {Array.from(new Array(pages)).map((_, step) => (
          <span
            key={step}
            onClick={() => {
              setPageNumber(step);
            }}
            className={`transition-all w-2.5 h-2.5 rounded-full cursor-pointer bg-stone-700 ${activePage === step && '!w-10 !bg-pastel-purple dark:!bg-purple'
              }`}
          ></span>
        ))}
      </div>
      <button
        disabled={activePage === pages - 1}
        onClick={() => {
          if (activePage < pages) {
            setPageNumber(activePage + 1);
          }
        }}
        className={`bg-pastel-purple dark:!bg-purple disabled:opacity-60 p-3 w-10 h-10 rounded-3xl transition-all duration-400 `}
      >
        <img
          src="/assets/images/Shared/next-page.svg"
          className="translate-x-[1px] w-4 h-4 opacity-1 transition-all"
          alt=""
        />
      </button>
    </section>
  );
}
