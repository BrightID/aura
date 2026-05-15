const NewEvaluationCard = ({
  subjectId,
  setShowEvaluationFlow,
}: {
  subjectId: string;
  setShowEvaluationFlow: (value: boolean) => void;
}) => {
  return (
    <div>
      <div className="flex items-center w-full gap-2">
        <EvaluateButton
          setShowEvaluationFlow={setShowEvaluationFlow}
          subjectId={subjectId}
          image="/assets/images/SubjectProfile/subject-evaluation-big.svg"
        />
      </div>
    </div>
  );
};

export default NewEvaluationCard;

const EvaluateButton = ({
  image,
  subjectId,
  setShowEvaluationFlow,
}: {
  image: string;
  subjectId: string;
  setShowEvaluationFlow: (value: boolean) => void;
}) => {
  return (
    <button
      type="button"
      onClick={() => setShowEvaluationFlow(true)}
      data-testid={`evaluate-not-evaluated-subject-${subjectId}`}
      className="flex gap-2.5 justify-center w-full items-center bg-primary text-primary-foreground rounded-md px-4 py-3 font-bold cursor-pointer hover:bg-primary/90 transition-colors"
    >
      <img src={image} alt="" />
      Evaluate Now!
    </button>
  );
};
