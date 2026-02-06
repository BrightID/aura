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
        <div
          data-testid={`evaluate-not-evaluated-subject-${subjectId}`}
          onClick={() => setShowEvaluationFlow(true)}
          className="flex-1 flex flex-row py-4 justify-center items-center bg-natural-black gap-2.5 rounded-lg cursor-pointer"
        >
          <img
            className=" w-auto -mr-1"
            src="/assets/images/SubjectProfile/evaluate-now-black.svg"
            alt=""
          />
          <p className="font-bold">Evaluate now!</p>
        </div>
      </div>
    </>
  );
};

export default NotEvaluatedCard;
