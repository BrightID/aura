const NotEvaluatedCard = ({
  subjectId,
  setShowEvaluationFlow,
}: {
  subjectId: string;
  setShowEvaluationFlow: (value: boolean) => void;
}) => {
  return (
    <>
      <div className="flex items-center gap-2.5 justify-between">
        <button
          type="button"
          data-testid={`evaluate-not-evaluated-subject-${subjectId}`}
          onClick={() => setShowEvaluationFlow(true)}
          className="flex-1 flex flex-row py-4 justify-center items-center bg-primary text-primary-foreground gap-2.5 rounded-lg cursor-pointer font-bold hover:bg-primary/90 transition-colors"
        >
          <img
            className="w-auto -mr-1"
            src="/assets/images/SubjectProfile/evaluate-now-black.svg"
            alt=""
          />
          Evaluate now!
        </button>
      </div>
    </>
  );
};

export default NotEvaluatedCard;
